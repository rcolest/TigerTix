const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Absolute path to shared-db/database.sqlite
const dbPath = path.join(__dirname, '..', 'shared-db', 'database.sqlite');
// Absolute path to init.sql
const initSqlPath = path.join(__dirname, '..', '..', 'shared-db', 'init.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Read the init.sql file
const initSql = fs.readFileSync(initSqlPath, 'utf8');

// Execute SQL to create table if it doesn't exist
db.exec(initSql, (err) => {
  if (err) {
    console.error('❌ Error initializing database:', err.message);
  } else {
    console.log('Database initialized successfully.');
  }
});

module.exports = db