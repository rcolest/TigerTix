import * as llmModel from "../models/llmModel.js";

export const parseMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const result = await llmModel.parseMessage(message);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { event, tickets } = req.body;
    if (!event || !tickets) return res.status(400).json({ error: "Missing event or tickets" });

    const result = await llmModel.bookTicket(event, tickets);
    res.json({ message: `✅ ${tickets} tickets booked for ${event}`, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
