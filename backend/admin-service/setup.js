const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');
const initSQL = fs.readFileSync(path.resolve(__dirname, '../shared-db/init.sql'), 'utf8');

const db = new sqlite3.Database(dbPath);

db.exec(initSQL, (err) => {
    if(err){
        console.error('Error initializing database:', err.message);
    }else{
        console.log('Database initialized successfully.');
    }
    db.close();
});