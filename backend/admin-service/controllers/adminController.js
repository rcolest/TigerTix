const adminModel = require('../models/adminModel');

exports.addEvent = (req, res) => {
  const { name, date, num_tickets } = req.body;

  if (!name || !date || !num_tickets) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  adminModel.createEvent({ name, date, num_tickets }, (err, result) => {
    if (err) {
      console.error('Error inserting event:', err);
      return res.status(500).json({ error: 'Failed to add event' });
    }
    res.status(201).json({ message: 'Event added successfully', eventId: result.id });
  });
};