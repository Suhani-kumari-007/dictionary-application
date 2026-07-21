const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite Database");
    }
});

// Create table
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT UNIQUE NOT NULL,
            meaning TEXT NOT NULL
        )
    `);

    // Sample Data
    db.run(
        `INSERT OR IGNORE INTO words (word, meaning)
         VALUES (?, ?)`,
        ["computer", "An electronic device that processes data."]
    );

    db.run(
        `INSERT OR IGNORE INTO words (word, meaning)
         VALUES (?, ?)`,
        ["apple", "A sweet fruit."]
    );

    db.run(
        `INSERT OR IGNORE INTO words (word, meaning)
         VALUES (?, ?)`,
        ["cat", "A domestic animal."]
    );

    db.run(
        `INSERT OR IGNORE INTO words (word, meaning)
         VALUES (?, ?)`,
        ["dog", "A loyal animal."]
    );

    db.run(
        `INSERT OR IGNORE INTO words (word, meaning)
         VALUES (?, ?)`,
        ["book", "A collection of written pages."]
    );

});

module.exports = db;