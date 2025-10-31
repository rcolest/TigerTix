const llmModel = require('../models/llmModel');

exports.parseMessage = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const result = await llmModel.parseWithLLM(message);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.confirmBooking = async (req, res) => {
  const { event, tickets } = req.body;
  if (!event || !tickets) {
    return res.status(400).json({ error: "Event and ticket count required" });
  }

  try {
    const result = await llmModel.bookTickets(event, tickets);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};