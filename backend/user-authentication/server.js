import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from './middleware/authMiddleware.js';
import userAuthRoutes from './routes/userAuthRoutes.js';
import Database from "better-sqlite3";

const app = express();

const allowedOrigins = [
  "https://tiger-tix-lovat.vercel.app",
  "https://tiger-phpcq9mdn-jonah-colestocks-projects.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 
    if (origin.endsWith(".vercel.app") || origin === "https://tiger-tix-lovat.vercel.app") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true
}));

app.options(/.*/, cors());

app.use(express.json());
app.use("", userAuthRoutes);

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is protected!` });
});

const CLIENT_URL = process.env.BACKEND_URL || "http://localhost:10000/client";

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
const db = new Database(dbPath, { verbose: console.log });

const SECRET_KEY = process.env.JWT_SECRET;

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

export default app;
