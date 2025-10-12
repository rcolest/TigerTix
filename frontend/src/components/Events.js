import React, { useState, useEffect } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const clientUrl = "http://localhost:6001/api/events";

  /* 
  * Loads in the list of events to display to the end user.
  * INPUTS: None
  * RETURNS: None
  */
  const fetchEvents = async () => {
    try {
      const res = await fetch(clientUrl);
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /*
  * Attempts to purchase a ticket from a specific event.
  * INPUTS:
  * id - The ID of the event which is being purchased from.
  * RETURNS: A message confirming the purchase of the ticket.
  * Will error if the event ID does not exist, or if there are no more tickets left in that event.
  */
  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${clientUrl}/${id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        setMessage(`❌ ${data.error}`);
        return;
      }

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, num_tickets: data.event.num_tickets } : event
        )
      );
      setMessage(`✅ Ticket purchased for ${events.find(e => e.id === id).name}`);
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      setMessage("❌ Error purchasing ticket");
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h2>Campus Events</h2>
      {message && <p role="status">{message}</p>}
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "10px" }}>
            <h3>{event.name}</h3>
            <p>Date: {event.date}</p>
            <p>Tickets Available: {event.num_tickets}</p>
            <button
              onClick={() => buyTicket(event.id)}
              disabled={event.num_tickets <= 0}
              aria-label={`Buy 1 ticket for ${event.name}, ${event.num_tickets} tickets remaining`}
            >
              Buy Ticket
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
