import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new Database(dbPath);

export const getAllEvents = () => {
  return db.prepare("SELECT * FROM events").all();
};

export const purchaseTicket = (eventId) => {
  const begin = db.prepare("BEGIN");
  const commit = db.prepare("COMMIT");
  const rollback = db.prepare("ROLLBACK");

  begin.run();

  try {
    const row = db.prepare("SELECT num_tickets FROM events WHERE id = ?").get(eventId);
    if (!row) {
      rollback.run();
      throw new Error("Event not found");
    }

    if (row.num_tickets <= 0) {
      rollback.run();
      throw new Error("No tickets left");
    }

    const newCount = row.num_tickets - 1;

    db.prepare("UPDATE events SET num_tickets = ? WHERE id = ?").run(newCount, eventId);

    commit.run();

    return { id: eventId, num_tickets: newCount };
  } catch (err) {
    rollback.run();
    throw err;
  }
};
