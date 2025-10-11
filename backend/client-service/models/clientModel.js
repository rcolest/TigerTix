const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Error connecting to database:', err.message);
  else console.log('✅ Client DB connected');
});

exports.getAllEvents = (callback) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    callback(err, rows);
  });
};

exports.purchaseTicket = (eventId, callback) => {
  db.get('SELECT num_tickets FROM events WHERE id = ?', [eventId], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error('Event not found'));
    if (row.num_tickets <= 0) return callback(new Error('No tickets left'));

    const newCount = row.num_tickets - 1;
    db.run('UPDATE events SET num_tickets = ? WHERE id = ?', [newCount, eventId], function(err) {
      if (err) return callback(err);
      callback(null, { id: eventId, num_tickets: newCount });
    });
  });
};