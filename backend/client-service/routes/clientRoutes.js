import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "..", "shared-db", "database.sqlite");

const db = new Database(dbPath);

router.get("/events", (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM events").all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/purchase", (req, res) => {
  try {
    const id = Number(req.params.id);

    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.num_tickets <= 0) return res.status(400).json({ error: "No tickets left" });

    db.prepare("UPDATE events SET num_tickets = num_tickets - 1 WHERE id = ?").run(id);
    const updatedEvent = db.prepare("SELECT * FROM events WHERE id = ?").get(id);

    res.json({ event: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
