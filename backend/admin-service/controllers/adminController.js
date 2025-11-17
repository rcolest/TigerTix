import * as adminModel from '../models/adminModel.js';

/* Creates a new event, and adds it to the database.
 * INPUTS:
 * req - Array containing the name, data, and number of tickets for the event.
 * res - The result of the call.
 * RETURNS:
 * 201 success code if the event is added.
 * 500 server error if the database is unable to add the event.
*/
export const addEvent = (req, res) => {
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

/* Prints a list of every event in the database.
 * RETURNS:
 * A list of all events in the database.
 * Will result in a 500 server error if the database is unable to list its events.
*/
export const getEvents = (req, res) => {
  adminModel.getAllEvents((err, rows) => {
    if (err) {
      console.error('🧠 Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};
