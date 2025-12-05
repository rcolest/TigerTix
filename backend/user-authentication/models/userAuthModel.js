import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
const dbDir = path.dirname(dbPath);

// Initialize database immediately
let db;
try {
  console.log("[DB] Initializing database at:", dbPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    console.log("[DB] Creating directory:", dbDir);
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create database connection
  db = new Database(dbPath);
  console.log("[DB] Database connection opened");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      num_tickets INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS savedaccounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
  console.log("[DB] Schema initialized");
} catch (error) {
  console.error("[DB] FATAL ERROR during initialization:", error);
  process.exit(1);
}

export const findUserByUsername = (username) => {
  try {
    const sql = `SELECT * FROM savedaccounts WHERE username = ?`;
    return db.prepare(sql).get(username) || null;
  } catch (error) {
    console.error("[DB] Error in findUserByUsername:", error);
    throw error;
  }
};

export const createUser = ({ username, hashedPassword }) => {
  try {
    const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
    const stmt = db.prepare(sql);
    const info = stmt.run(username, hashedPassword);
    return { id: info.lastInsertRowid };
  } catch (error) {
    console.error("[DB] Error in createUser:", error);
    throw error;
  }
};
