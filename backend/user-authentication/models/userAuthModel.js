import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
const dbDir = path.dirname(dbPath);
let db = null;

const initializeDb = () => {
  try {
    if (db && typeof db.prepare === 'function') {
      return db;
    }

    console.log("DB Path:", dbPath);

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      console.log("Creating database directory:", dbDir);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    db = new Database(dbPath);
    console.log("SQLite opened successfully.");

    // Verify database is valid
    if (!db || typeof db.prepare !== 'function') {
      throw new Error("Database object is invalid");
    }

    // Initialize schema if tables don't exist
    const checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='savedaccounts'");
    const tableExists = checkTable.get();
    
    if (!tableExists) {
      console.log("Creating tables...");
      const initSql = `
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          num_tickets INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS savedaccounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL
        );
      `;
      db.exec(initSql);
      console.log("Tables created successfully.");
    }

    return db;
  } catch (error) {
    console.error("DB init error:", error);
    db = null;
    throw error;
  }
};

export const findUserByUsername = (username) => {
  const database = initializeDb();
  if (!database || typeof database.prepare !== 'function') {
    throw new Error("Database not initialized or invalid");
  }
  const sql = `SELECT * FROM savedaccounts WHERE username = ?`;
  return database.prepare(sql).get(username) || null;
};

export const createUser = ({ username, hashedPassword }) => {
  const database = initializeDb();
  if (!database || typeof database.prepare !== 'function') {
    throw new Error("Database not initialized or invalid");
  }
  const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
  const stmt = database.prepare(sql);
  const info = stmt.run(username, hashedPassword);
  return { id: info.lastInsertRowid };
};
