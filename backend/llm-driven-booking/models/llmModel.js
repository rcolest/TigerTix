import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Error connecting to database:', err.message);
  else console.log(`✅ SQLite connected at ${dbPath}`);
});

export const getAllEvents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
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
  const events = await getAllEvents();
  const event = events.find(e => e.name === eventName);
  if (!event) throw new Error("Event not found");

  const eventId = event.id;
  let lastPurchase;

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const purchaseLoop = (i) => {
        if (i >= tickets) {
          db.run("COMMIT", (err) => (err ? reject(err) : resolve()));
          return;
        }

        db.get('SELECT num_tickets FROM events WHERE id = ?', [eventId], (err, row) => {
          if (err) return db.run("ROLLBACK", () => reject(err));
          if (!row) return db.run("ROLLBACK", () => reject(new Error('Event not found')));
          if (row.num_tickets <= 0) return db.run("ROLLBACK", () => reject(new Error('No tickets left')));

          const newCount = row.num_tickets - 1;
          db.run('UPDATE events SET num_tickets = ? WHERE id = ?', [newCount, eventId], (err) => {
            if (err) return db.run("ROLLBACK", () => reject(err));
            lastPurchase = { id: eventId, num_tickets: newCount };
            purchaseLoop(i + 1);
          });
        });
      };

      purchaseLoop(0);
    });
  });

  return lastPurchase;
};
