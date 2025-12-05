import fs from 'fs';
import path from 'path';
import Database from "better-sqlite3";

const dbPath = path.join(__dirname, '..', 'shared-db', 'database.sqlite');
const initSqlPath = path.join(__dirname, '..', 'shared-db', 'init.sql');

const db = new Database(dbPath, { verbose: console.log });

const initSql = fs.readFileSync(initSqlPath, 'utf8');

db.exec(initSql, (err) => {
  if (err) {
    console.error('❌ Error initializing database:', err.message);
  } else {
    console.log('Database initialized successfully.');
  }
});

export default db;
