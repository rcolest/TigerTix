import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
