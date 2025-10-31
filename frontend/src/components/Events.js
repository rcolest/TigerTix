import React, { useState, useEffect } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(-1);
  const [usingChatbot, setUsingChatbot] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);

  const clientUrl = "http://localhost:6001/api/events";
  const llmUrl = "http://localhost:7001/api/llm";

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
      setMessage("❌ Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /*
  * Toggles the state of displaying the confirmation buttons.
  * INPUTS:
  * id - The ID of the event which is being purchased from.
  * confirm - The state to switch the confirmation to.
  * RETURNS: A message about the switching of confirmation.
  */
  const confirmToggle = (id, state) => {
    setConfirm(state);
    setConfirmId(state ? id : -1);
    if (!state) setMessage("✅ Ticket purchase cancelled");
  };

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

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, num_tickets: data.event.num_tickets } : e))
      );
      setMessage(`✅ Ticket purchased for ${events.find((e) => e.id === id).name}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error purchasing ticket");
    }
    setConfirm(false);
  };

  const triggerChatbot = async (e) => {
    e.preventDefault();
    if (!chatInput) return;

    try {
      const res = await fetch(`${llmUrl}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();

      if (data.error) {
        setMessage(`❌ ${data.error}`);
        return;
      }

      if (data.intent === "book") {
        const eventObj = events.find((e) => e.name.toLowerCase() === data.event.toLowerCase());
        if (!eventObj) {
          setMessage(`❌ Event "${data.event}" not found`);
          return;
        }

        setPendingBooking({ event: eventObj.name, tickets: data.tickets });
        setConfirmId(eventObj.id);
        setConfirm(true);
        setMessage(`🤖 I can book ${data.tickets} ticket(s) for ${eventObj.name}. Confirm?`);
      } else {
        setMessage(`🤖 ${data.response || "I didn't understand that."}`);
      }
    } catch (err) {
      console.error("Error with chatbot:", err);
      setMessage("❌ Error with chatbot");
    }
  };

  const confirmLLMBooking = async () => {
    if (!pendingBooking) return;

    try {
      const res = await fetch(`${llmUrl}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingBooking),
      });

      const result = await res.json();
      if (result.error) {
        setMessage(`❌ ${result.error}`);
      } else {
        setMessage(result.message || "✅ Booking complete!");
      }

      setPendingBooking(null);
      setConfirm(false);
      setConfirmId(-1);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("❌ Booking failed");
      setPendingBooking(null);
      setConfirm(false);
      setConfirmId(-1);
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h2>Campus Events</h2>

      {!usingChatbot && (
        <button onClick={() => setUsingChatbot(true)}>Try our chatbot!</button>
      )}

      {usingChatbot && (
        <form name="chatbotBox" onSubmit={triggerChatbot}>
          <input
            type="text"
            name="message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
      )}

      {message && <p role="status">{message}</p>}

      {pendingBooking && (
        <button onClick={confirmLLMBooking} aria-label="Confirm LLM booking">
          ✅ Confirm Booking
        </button>
      )}

      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "10px" }}>
            <h3>{event.name}</h3>
            <p>Date: {event.date}</p>
            <p>Tickets Available: {event.num_tickets}</p>

            {!(confirm && confirmId === event.id) && (
              <button
                onClick={() => confirmToggle(event.id, true)}
                disabled={event.num_tickets <= 0}
              >
                Buy Ticket
              </button>
            )}

            {confirm && confirmId === event.id && !pendingBooking && (
              <>
                <button onClick={() => buyTicket(event.id)}>Yes</button>
                <button onClick={() => confirmToggle(event.id, false)}>No</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
