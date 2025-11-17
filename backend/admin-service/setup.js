import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'shared-db', 'database.sqlite');
const initSqlPath = path.join(__dirname, '..', 'shared-db', 'init.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

const initSql = fs.readFileSync(initSqlPath, 'utf8');

db.exec(initSql, (err) => {
  if (err) {
    console.error('❌ Error initializing database:', err.message);
  } else {
    console.log('Database initialized successfully.');
  }
});

export default db;
