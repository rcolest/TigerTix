const adminModel = require('../models/adminModel');

// Add a new event
exports.addEvent = (req, res) => {
  const { name, date, num_tickets } = req.body;

  if (!name || !date || !num_tickets) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  adminModel.createEvent({ name, date, num_tickets }, (err, result) => {
    if (err) {
      console.error('🧠 Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Event added successfully', eventId: result.id });
  });
};

// Optional: get all events
exports.getEvents = (req, res) => {
  adminModel.getAllEvents((err, rows) => {
    if (err) {
      console.error('🧠 Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};