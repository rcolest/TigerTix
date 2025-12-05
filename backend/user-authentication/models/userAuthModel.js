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
      console.log("DB Path:", dbPath);

      if (!fs.existsSync(dbPath)) {
        console.error("DATABASE FILE DOES NOT EXIST:", dbPath);
      }

      db = new Database(dbPath);
      console.log("SQLite opened successfully.");
    }
    return db;
  } catch (error) {
    console.error("DB init error:", error);
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
