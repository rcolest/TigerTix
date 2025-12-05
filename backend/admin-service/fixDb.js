import path from 'path';
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

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
