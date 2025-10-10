const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

function createEvent(eventData, callback){
    const db = new sqlite3.Database(dbPath);
    const { name, data, num_tickets } = eventData;

    const query = 'INSERT INTO events (name, date, num_tickets) VALUES (?, ?, ?)';
    db.run(query, [name, date, num_tickets], function(err){
        db.close();
        if(err){
            return callback(err);
        }
        callback(null, { id: this.lastID })
    });
}

module.exports = { createEvent };