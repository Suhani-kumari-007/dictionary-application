const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

const multer = require("multer");
const fs = require("fs");

app.use(cors());
app.use(express.json());

const upload = multer({
    dest: "uploads/"
});

const path = require("path");
// Serve Frontend
app.use(express.static(path.join(__dirname, "public")));

// =========================
// Home Route
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// Get All Words
// =========================

app.get("/words", (req, res) => {

    db.all(
        "SELECT * FROM words ORDER BY word ASC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});

// =========================
// Search Word
// =========================

app.get("/search/:word", (req, res) => {

    const word = req.params.word.toLowerCase();

    db.get(

        "SELECT * FROM words WHERE word=?",

        [word],

        (err, row) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (!row) {

                return res.status(404).json({

                    message: "Word not found"

                });

            }

            res.json(row);

        }

    );

});

// =========================
// Search Suggestions
// =========================

app.get("/suggest/:prefix", (req, res) => {

    const prefix = req.params.prefix.toLowerCase();

    db.all(

        "SELECT word FROM words WHERE word LIKE ? LIMIT 10",

        [prefix + "%"],

        (err, rows) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

});

// =========================
// Add Word
// =========================

app.post("/add", (req, res) => {

    const { word, meaning } = req.body;

    if (!word || !meaning) {

        return res.status(400).json({

            message: "Word and meaning are required."

        });

    }

    db.run(

        "INSERT INTO words(word,meaning) VALUES(?,?)",

        [word.toLowerCase(), meaning],

        function (err) {

            if (err) {

                return res.status(500).json({

                    message: "Word already exists or database error."

                });

            }

            res.json({

                message: "Word added successfully!"

            });

        }

    );

});

// ==========================
// Import Words
// ==========================

app.post("/import", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded."
        });
    }

    const content = fs.readFileSync(req.file.path, "utf8");

    const lines = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");

    const stmt = db.prepare(
        "INSERT OR IGNORE INTO words(word, meaning) VALUES (?, ?)"
    );

    let imported = 0;

    for (let i = 0; i < lines.length; i += 2) {

        const word = lines[i];
        const meaning = lines[i + 1] || "";

        stmt.run(word, meaning);

        imported++;
    }

    stmt.finalize();

    fs.unlinkSync(req.file.path);

    res.json({
        message: `${imported} words imported successfully!`
    });

});

// =========================
// Update Word
// =========================

app.put("/update", (req, res) => {

    const { word, meaning } = req.body;

    if (!word || !meaning) {

        return res.status(400).json({

            message: "Word and meaning are required."

        });

    }

    db.run(

        "UPDATE words SET meaning=? WHERE word=?",

        [meaning, word.toLowerCase()],

        function (err) {

            if (err) {

                return res.status(500).json({

                    message: "Database Error"

                });

            }

            if (this.changes === 0) {

                return res.status(404).json({

                    message: "Word not found"

                });

            }

            res.json({

                message: "Word updated successfully!"

            });

        }

    );

});

// =========================
// Delete Word
// =========================

app.delete("/delete/:word", (req, res) => {

    const word = req.params.word.toLowerCase();

    db.run(

        "DELETE FROM words WHERE word=?",

        [word],

        function (err) {

            if (err) {

                return res.status(500).json({

                    message: "Database Error"

                });

            }

            if (this.changes === 0) {

                return res.status(404).json({

                    message: "Word not found"

                });

            }

            res.json({

                message: "Word deleted successfully!"

            });

        }

    );

});

// =========================
// Total Words
// =========================

app.get("/count", (req, res) => {

    db.get(

        "SELECT COUNT(*) AS total FROM words",

        [],

        (err, row) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.json(row);

        }

    );

});

// =========================
// Server
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});