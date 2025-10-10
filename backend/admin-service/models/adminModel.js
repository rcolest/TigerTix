const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

exports.createEvent = ({ name, date, num_tickets }, callback) => {
  db.run(
    `INSERT INTO events (name, date, num_tickets) VALUES (?, ?, ?)`,
    [name, date, num_tickets],
    function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, { id: this.lastID });
      }
    }
  );
};