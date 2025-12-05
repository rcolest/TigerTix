import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername, createUser } from "../models/userAuthModel.js";

export const loginUser = (req, res) => {
  const { username, password } = req.body;

  const user = findUserByUsername(username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
};

export const registerUser = (req, res) => {
  const { username, password } = req.body;

  const existing = findUserByUsername(username);
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = createUser({ username, hashedPassword });

  res.json({ id: result.id, username });
};
