const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
exports.createEvent = ({ name, date, num_tickets }, callback) => {
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
exports.getAllEvents = (callback) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) callback(err);
    else callback(null, rows);
  });
};