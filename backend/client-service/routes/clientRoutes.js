import express from "express";
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

// Proxy registration request
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

// Proxy login request
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

// List all events
router.get("/events", (req, res) => {
    try {
        const events = db.prepare("SELECT * FROM events").all();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Purchase a ticket for an event
router.post("/:id/purchase", (req, res) => {
    try {
        const eventId = parseInt(req.params.id, 10);
        const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId);

        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.num_tickets <= 0) return res.status(400).json({ error: "No tickets left" });

        const updated = db.prepare("UPDATE events SET num_tickets = num_tickets - 1 WHERE id = ?").run(eventId);
        const updatedEvent = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId);

        res.json({ event: updatedEvent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
