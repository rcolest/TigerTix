const ollame = require('ollama')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.on('open', () => {
  console.log(`✅ SQLite connected at ${dbPath}`);
});

exports.parseWithLLM = async (message) => {
  try {
    const response = await ollama.chat({
      model: "llama3.1",
      messages: [
        { role: "system", content: "Extract event name, ticket count, and intent. Only output JSON like {intent: 'book', event: 'Jazz Night', tickets: 2}" },
        { role: "user", content: message }
      ],
    });

    return JSON.parse(response.message.content);
  } catch (err) {
    const fallback = parseFallback(message);
    if (fallback) return fallback;
    throw new Error("LLM could not parse message");
  }
};

function parseFallback(text) {
  const lower = text.toLowerCase();

  if (lower.includes("book")) {
    const num = parseInt(text);
    return {
      intent: "book",
      event: extractEventName(text),
      tickets: isNaN(num) ? 1 : num
    };
  }
  return null;
}

const extractEventName = (text) => {
  const words = text.split(" ");
  return words.slice(-2).join(" ");
};


exports.bookTickets = (eventName, tickets) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.get("SELECT id, num_tickets FROM events WHERE name = ?", [eventName], (err, event) => {
        if (err) return rollback(err);
        if (!event) return rollback(new Error("Event not found"));
        if (event.num_tickets < tickets) return rollback(new Error("Not enough tickets available"));

        db.run("UPDATE events SET num_tickets = num_tickets - ? WHERE id = ?", [tickets, event.id], (err2) => {
          if (err2) return rollback(err2);

          db.run("COMMIT");
          resolve({ message: "✅ Tickets booked", event: eventName, tickets });
        });
      });

      function rollback(e) {
        db.run("ROLLBACK");
        reject(e);
      }
    });
  });
};