import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
console.log("DB Path:", dbPath);
const db = new Database(dbPath, { verbose: console.log });

/* Prints a list of every event in the database.
 * RETURNS:
 * A list of all events in the database.
 * Will result in a 500 server error if the database is unable to list its events.
*/
export const getAllEvents = () => {
  return db.prepare('SELECT * FROM events').all();
};


/* Attempts to "purchase" a ticket for a selected event from the database; this deducts one ticket from its data.
 * INPUTS:
 * eventId - The ID of the ticket.
 * RETURNS:
 * The new number of tickets remaining in the event.
 * 400 client error if the ticket is unable to be deducted, such as having no tickets remaining or the event ID not existing.
*/
export const purchaseTicket = (eventId, callback) => {
  const sql = `
    UPDATE events
    SET num_tickets = num_tickets - 1
    WHERE id = ? AND num_tickets > 0
  `;
  
  db.run(sql, [eventId], function(err) {
    if (err) return callback(err);

    if (this.changes === 0) {
      return db.get('SELECT id FROM events WHERE id = ?', [eventId], (err2, row) => {
        if (err2) return callback(err2);
        if (!row) return callback(new Error('Event not found'));
        return callback(new Error('No tickets left'));
      });
    }

    db.get('SELECT num_tickets FROM events WHERE id = ?', [eventId], (err2, row) => {
      if (err2) return callback(err2);
      callback(null, { id: eventId, num_tickets: row.num_tickets });
    });
  });
};
