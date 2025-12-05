import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
let db = null;

const initializeDb = () => {
  try {
    if (!db) {
      db = new Database(dbPath, { verbose: console.log });
      console.log(`Database initialized at ${dbPath}`);
    }
    return db;
  } catch (error) {
    console.error(`Failed to initialize database at ${dbPath}:`, error);
    throw error;
  }
};

export const findUserByUsername = (username) => {
  const database = initializeDb();
  if (!database) throw new Error("Database not initialized");
  const sql = `SELECT * FROM savedaccounts WHERE username = ?`;
  return database.prepare(sql).get(username) || null;
};

export const createUser = ({ username, hashedPassword }) => {
  const database = initializeDb();
  if (!database) throw new Error("Database not initialized");
  const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
  const stmt = database.prepare(sql);
  const info = stmt.run(username, hashedPassword);
  return { id: info.lastInsertRowid };
};
