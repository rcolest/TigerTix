import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername, createUser } from "../models/userAuthModel.js";

const SECRET_KEY = process.env.JWT_SECRET;

// REGISTER
export const registerUser = (req, res) => {
  const { username, password } = req.body;

  const existing = findUserByUsername(username);
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = createUser({ username, hashedPassword });

  res.json({ id: newUser.id, username });
};

// LOGIN
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  const user = findUserByUsername(username);
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
};

// LOGOUT
export const logoutAccount = (req, res) => {
  res.json({ message: "Logged out" });
};
