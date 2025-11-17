import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

const CLIENT_URL = "http://localhost:6001"; 

app.get("/api/events", async (req, res) => {
  try {
    const response = await fetch(`${CLIENT_URL}/api/events`, {
      headers: { cookie: req.headers.cookie || "" },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch events from client service" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Could not fetch events" });
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "shared-db", "database.sqlite");
const db = new sqlite3.Database(dbPath);

app.post("/api/register", async (req, res) => {
  console.log("🔥 Incoming /api/register body:", req.body);
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  db.get("SELECT * FROM savedaccounts WHERE username = ?", [username], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (row) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO savedaccounts (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err2) {
        if (err2) return res.status(500).json({ message: err2.message });
        res.status(201).json({ message: "Registration successful" });
      }
    );
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM savedaccounts WHERE username = ?", [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid username or password" });

    res.json({ message: "Login successful" });
  });
});

app.post("/api/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

app.post("/api/events/:id/purchase", async (req, res) => {
  try {
    const response = await fetch(`${CLIENT_URL}/api/events/${req.params.id}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      credentials: "include"
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error proxying purchase:", err);
    res.status(500).json({ error: "Could not purchase ticket" });
  }
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Auth service running on http://localhost:${PORT}`);
});