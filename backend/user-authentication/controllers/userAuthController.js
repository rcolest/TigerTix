import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

let modelFunctions = null;

const loadModel = async () => {
  if (modelFunctions) return modelFunctions;
  const mod = await import("../models/userAuthModel.js");
  modelFunctions = {
    findUserByUsername: mod.findUserByUsername,
    createUser: mod.createUser
  };
  return modelFunctions;
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { findUserByUsername, createUser } = await loadModel();
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
export const loginUser = async (req, res) => {
  try {
    const { findUserByUsername } = await loadModel();
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
  return res.json({ message: "Logged out" });
};
