import * as clientModel from '../models/clientModel.js';

/* Prints a list of every event in the database.
 * RETURNS:
 * A list of all events in the database.
 * Will result in a 500 server error if the database is unable to list its events.
*/
export const getEvents = (req, res) => {
  clientModel.getAllEvents((err, events) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(events);
  });
};

/* Attempts to "purchase" a ticket for a selected event from the database; this deducts one ticket from its data.
 * INPUTS:
 * req - Array containing the ID of the ticket.
 * res - The result of the call.
 * RETURNS:
 * 200 success code if the ticket is deducted.
 * 400 client error if the ticket is unable to be deducted, such as having no tickets remaining.
*/
export const purchaseEvent = (req, res) => {
  const eventId = parseInt(req.params.id);
  clientModel.purchaseTicket(eventId, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Ticket purchased successfully', event: result });
  });
};
