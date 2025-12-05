import path from 'path';
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

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
export const getAllEvents = () => {
  const stmt = db.prepare('SELECT * FROM events');
  return stmt.all();
};

