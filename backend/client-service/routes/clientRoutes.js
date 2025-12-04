import express from "express";
import sqlite3 from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const router = express.Router();

const USER_AUTH_URL = process.env.USER_AUTH_URL || "https://tigertix-0qva.onrender.com/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");
console.log("DB Path:", dbPath);
const db = new Database(dbPath, { verbose: console.log });

router.post("/register", async (req, res) => {
    try {
        const response = await fetch(`${USER_AUTH_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
            credentials: "include"
        });
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(500).json({ message: "Proxy error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const response = await fetch(`${USER_AUTH_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
            credentials: "include"
        });
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(500).json({ message: "Proxy error" });
    }
});

router.get("/events", (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM events").all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/purchase", (req, res) => {
    const eventId = req.params.id;

    db.get("SELECT num_tickets FROM events WHERE id = ?", [eventId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Event not found" });
        if (row.num_tickets <= 0) return res.status(400).json({ error: "No tickets left" });

        db.run(
            "UPDATE events SET num_tickets = num_tickets - 1 WHERE id = ?",
            [eventId],
            function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                db.get("SELECT * FROM events WHERE id = ?", [eventId], (getErr, updatedRow) => {
                    if (getErr) return res.status(500).json({ error: getErr.message });
                    res.json({ event: updatedRow });
                });
            }
        );
    });
});

export default router;
