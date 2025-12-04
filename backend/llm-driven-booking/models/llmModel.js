import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

export const getAllEvents = () => {
  return db.prepare("SELECT * FROM events").all();
};

const wordToNumber = {
  'a': 1,
  'an': 1,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10,
};

export const parseMessage = async (message) => {
  if (!message) throw new Error('No message provided');

  const lower = message.toLowerCase();
  const events = await getAllEvents();

  let matchedEvent = null;
  for (const e of events) {
    if (lower.includes(e.name.toLowerCase())) {
      matchedEvent = e.name;
      break;
    }
  }

  if (!matchedEvent) {
    return { intent: 'unknown', response: "Sorry, I didn't understand which event." };
  }

  let tickets = 1; 

  const digitMatch = lower.match(/(\d+)/);
  if (digitMatch) {
    tickets = parseInt(digitMatch[1], 10);
  } else {
    for (const [word, num] of Object.entries(wordToNumber)) {
      const regex = new RegExp(`\\b${word}\\b`, 'i'); 
      if (regex.test(lower)) {
        tickets = num;
        break;
      }
    }
  }

  return {
    intent: 'book',
    event: matchedEvent,
    tickets
  };
};

export const bookTicket = async (eventName, tickets) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get('SELECT id, num_tickets FROM events WHERE name = ?', [eventName], (err, row) => {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        if (!row) {
          db.run('ROLLBACK');
          return reject(new Error('Event not found'));
        }
        if (row.num_tickets < tickets) {
          db.run('ROLLBACK');
          return reject(new Error('Not enough tickets left'));
        }

        const newCount = row.num_tickets - tickets;
        db.run(
          'UPDATE events SET num_tickets = ? WHERE id = ?',
          [newCount, row.id],
          function (err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              resolve({ id: row.id, num_tickets: newCount });
            });
          }
        );
      });
    });
  });
};
