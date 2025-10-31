const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Error connecting to database:', err.message);
  else console.log('✅ Client DB connected');
});

/* Prints a list of every event in the database.
 * RETURNS:
 * A list of all events in the database.
 * Will result in a 500 server error if the database is unable to list its events.
*/
exports.getAllEvents = (callback) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    callback(err, rows);
  });
};

/* Attempts to "purchase" a ticket for a selected event from the database; this deducts one ticket from its data.
 * INPUTS:
 * eventId - The ID of the ticket.
 * RETURNS:
 * The new number of tickets remaining in the event.
 * 400 client error if the ticket is unable to be deducted, such as having no tickets remaining or the event ID not existing.
*/
exports.purchaseTicket = (eventId, callback) => {
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