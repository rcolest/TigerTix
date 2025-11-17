import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

/* Creates a new event, and adds it to the database.
 * INPUTS:
 * name - The listed name for the event.
 * date - The date on which the event is to be held.
 * num_tickets - The number of tickets to be listed as part of this event.
*/
export const createEvent = ({ name, date, num_tickets }, callback) => {
  db.run(
    `INSERT INTO events (name, date, num_tickets) VALUES (?, ?, ?)`,
    [name, date, num_tickets],
    function (err) {
      if (err) callback(err);
      else callback(null, { id: this.lastID });
    }
  );
};

/* Prints a list of every event in the database.
 * RETURNS:
 * A list of all events in the database.
*/
export const getAllEvents = (callback) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) callback(err);
    else callback(null, rows);
  });
};
