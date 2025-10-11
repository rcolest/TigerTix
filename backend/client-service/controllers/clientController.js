const clientModel = require('../models/clientModel');

exports.getEvents = (req, res) => {
  clientModel.getAllEvents((err, events) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(events);
  });
};

exports.purchaseEvent = (req, res) => {
  const eventId = parseInt(req.params.id);
  clientModel.purchaseTicket(eventId, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Ticket purchased successfully', event: result });
  });
};