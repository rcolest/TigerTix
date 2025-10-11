import React, { useState, useEffect } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const clientUrl = "http://localhost:6001/api/events"; // your client-service

  // Fetch events from client service
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

  // Buy ticket
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

      // Update local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, num_tickets: data.event.num_tickets } : event
        )
      );
      setMessage(`✅ Ticket purchased for event ${id}`);
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      setMessage("❌ Error purchasing ticket");
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h2>Campus Events</h2>
      {message && <p>{message}</p>}
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "10px" }}>
            <strong>{event.name}</strong> <br />
            Date: {event.date} <br />
            Tickets Available: {event.num_tickets} <br />
            <button
              onClick={() => buyTicket(event.id)}
              disabled={event.num_tickets <= 0}
            >
              Buy Ticket
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}