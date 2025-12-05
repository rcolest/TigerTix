import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername, createUser } from "../models/userAuthModel.js";

const SECRET_KEY = process.env.JWT_SECRET;

// REGISTER
export const registerUser = (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = createUser({ username, hashedPassword });

    res.json({ id: newUser.id, username });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

// LOGIN
export const loginUser = (req, res) => {
  try {
    const { username, password } = req.body;

    const user = findUserByUsername(username);
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};


// LOGOUT
export const logoutAccount = (req, res) => {
  res.json({ message: "Logged out" });
};
