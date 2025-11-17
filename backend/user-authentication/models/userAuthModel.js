import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Error connecting to database:", err.message);
  else console.log(`✅ SQLite connected at ${dbPath}`);
});

export const findUserByUsername = (username, callback) => {
  const sql = `SELECT * FROM savedaccounts WHERE username = ?`;
  db.get(sql, [username], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

export const createUser = ({ username, hashedPassword }, callback) => {
  console.log("MODEL RECEIVED:", { username, hashedPassword });
  const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
  db.run(sql, [username, hashedPassword], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID });
  });
};
