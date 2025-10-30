// See https://github.com/ollama/ollama-js
import ollama from 'ollama';

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Error connecting to database:', err.message);
    else console.log('✅ Client DB connected');
});

exports.getAllEvents = (callback) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        callback(err, rows);
    });
};

exports.produceResponse = async (message, callback) => {
    const response = await ollama.chat({
        model: 'llama3.1',
        messages: [{ role: 'user', content: message }],
    });
    return callback(null, response.message.content);
}