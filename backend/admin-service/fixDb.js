const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`ALTER TABLE events ADD COLUMN date TEXT`, (err) => {
    if (err) {
      console.log('Probably column already exists:', err.message);
    } else {
      console.log('✅ Column "date" added successfully');
    }
  });
});

db.close();