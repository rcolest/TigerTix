import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new Database(dbPath);

// ------------------
//   DB QUERIES
// ------------------

export const getAllEvents = () => {
  return db.prepare("SELECT * FROM events").all();
};

const wordToNumber = {
  a: 1, an: 1, one: 1, two: 2, three: 3,
  four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10,
};

export const parseMessage = (message) => {
  if (!message) throw new Error("No message provided");

  const lower = message.toLowerCase();
  const events = getAllEvents();

  let matchedEvent = events.find(e =>
    lower.includes(e.name.toLowerCase())
  );

  if (!matchedEvent) {
    return { intent: "unknown", response: "Sorry, I didn't understand which event." };
  }

  // detect ticket count
  let tickets = 1;

  const digitMatch = lower.match(/\d+/);
  if (digitMatch) {
    tickets = parseInt(digitMatch[0]);
  } else {
    for (const [word, num] of Object.entries(wordToNumber)) {
      if (new RegExp(`\\b${word}\\b`).test(lower)) {
        tickets = num;
        break;
      }
    }
  }

  return {
    intent: "book",
    event: matchedEvent.name,
    tickets
  };
};

export const bookTicket = (eventName, tickets) => {
  const getEventStmt = db.prepare("SELECT id, num_tickets FROM events WHERE name = ?");
  const updateStmt = db.prepare("UPDATE events SET num_tickets = ? WHERE id = ?");
  const commit = db.prepare("COMMIT");
  const begin = db.prepare("BEGIN");
  const rollback = db.prepare("ROLLBACK");

  begin.run();

  try {
    const row = getEventStmt.get(eventName);
    if (!row) {
      rollback.run();
      throw new Error("Event not found");
    }

    if (row.num_tickets < tickets) {
      rollback.run();
      throw new Error("Not enough tickets left");
    }

    const newCount = row.num_tickets - tickets;
    updateStmt.run(newCount, row.id);

    commit.run();

    return { id: row.id, num_tickets: newCount };
  } catch (err) {
    rollback.run();
    throw err;
  }
};
