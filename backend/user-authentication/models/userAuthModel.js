import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
const db = new Database(dbPath, { verbose: console.log });

export const findUserByUsername = (username) => {
  const sql = `SELECT * FROM savedaccounts WHERE username = ?`;
  return db.prepare(sql).get(username) || null;
};

export const createUser = ({ username, hashedPassword }) => {
  const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
  const stmt = db.prepare(sql);
  const info = stmt.run(username, hashedPassword);
  return { id: info.lastInsertRowid };
};
