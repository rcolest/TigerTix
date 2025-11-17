import bcrypt from "bcrypt";
import { findUserByUsername, createUser } from "../models/userAuthModel.js";

export const registerUser = async (req, res) => {
    console.log("REGISTER BODY:", req.body);
    const { username, password } = req.body;
    console.log("Parsed:", { username, password });
    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    findUserByUsername(username, async (err, existingUser) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (existingUser) return res.status(409).json({ message: "Username already taken" });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("HASHED PASSWORD:", hashedPassword);
            createUser({ username, password: hashedPassword }, (err, result) => {
                if (err) return res.status(500).json({ message: "Error creating user" });
                res.status(201).json({ message: "User created successfully", id: result.id });
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
};


export const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    findUserByUsername(username, async (err, user) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            res.status(200).json({ message: "Login successful", userId: user.id });

        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
};

export const logoutAccount = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });
    return res.json({ message: "Logged out" });
};
