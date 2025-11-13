const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Error connecting to database:', err.message);
    else console.log(`✅ SQLite connected at ${dbPath}`);
});

exports.registerNewAccount = ({username, password}, callback) => {
    const sql = `INSERT INTO savedaccounts (username, password) VALUES (?, ?)`;
    db.run(sql, [username, password], function (err) {
        if (err) callback(err);
        else callback(null, { id: this.lastID });
    });
};

exports.findLoginInfo = ({ username, password }, callback) => {
    const sql = `SELECT * FROM savedaccounts WHERE username = ? AND pass = ?`;
    db.get(sql, [username, password], (err, rows) => {
        if (err) return callback(err);
        if (!rows) return callback(new Error('Username or password does not match.'));

        callback(null, { username: row.username, password: row.password });
    });
};