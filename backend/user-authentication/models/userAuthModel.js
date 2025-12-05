import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
const db = new Database(dbPath, { verbose: console.log });

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
