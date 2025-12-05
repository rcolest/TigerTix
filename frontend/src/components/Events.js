import React, { useState, useEffect } from "react";

export default function Events() {
  const API = process.env.REACT_APP_API_URL;

  const [events, setEvents] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API}/client/events`, {
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setEvents([]);
        setMessage(data.error || "Failed to load events");
        return;
      }
      setEvents(data);
    } catch (err) {
      setMessage("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const attemptLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }
      setLoggedIn(true);
      setMessage("Login successful!");
    } catch (err) {
      setMessage("Error logging in");
    }
  };

  const attemptRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Registration failed");
        return;
      }
      setMessage("Registration successful! Please log in.");
      setShowRegister(false);
    } catch (err) {
      setMessage("Error registering");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      setLoggedIn(false);
      setMessage("Logged out");
    } catch (err) {
      setMessage("Logout failed");
    }
  };

  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${API}/client/${id}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Purchase failed");
        return;
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, num_tickets: data.event.num_tickets } : e
        )
      );
      setMessage(`Ticket purchased for ${data.event.name}`);
    } catch (err) {
      setMessage("Error purchasing ticket");
    }
  };

  // CHATBOT: SEND MESSAGE
  const sendChatMessage = async () => {
  if (!chatInput.trim()) return;

  // Add user's message
  setChatMessages(prev => [...prev, { from: "user", text: chatInput }]);
    const messageToSend = chatInput;
    setChatInput("");
    try {
      // STEP 1: parse
      const parseRes = await fetch(`${API}/llm/parse`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend })
      });

      const parsed = await parseRes.json();

      if (!parseRes.ok || parsed.intent !== "book") {
        setChatMessages(prev => [
          ...prev,
          { from: "bot", text: parsed.response || "Sorry, I didn’t understand." }
        ]);
        return;
      }

      // STEP 2: book immediately
      const confirmRes = await fetch(`${API}/llm/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: parsed.event,
          tickets: parsed.tickets
        })
      });

      const booked = await confirmRes.json();

      if (!confirmRes.ok) {
        setChatMessages(prev => [
          ...prev,
          { from: "bot", text: booked.error || "Could not complete booking." }
        ]);
        return;
      }

      // Update UI after booking
      fetchEvents();

      setChatMessages(prev => [
        ...prev,
        { from: "bot", text: booked.message }
      ]);

    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { from: "bot", text: "Error contacting assistant." }
      ]);
    }
  };


  // LOGIN PAGE
  if (!loggedIn) {
    return (
      <div>
        <h2>{showRegister ? "Register" : "TigerTix Login"}</h2>
        {message && <p role="status">{message}</p>}

        {showRegister ? (
          <form onSubmit={attemptRegister}>
            <label>Email</label>
            <input
              type="text"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />

            <button type="submit">Register</button>

            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setShowRegister(false)}>
                Login
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={attemptLogin}>
            <label>Email</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit">Login</button>

            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setShowRegister(true)}>
                Register
              </button>
            </p>
          </form>
        )}
      </div>
    );
  }

  // MAIN PAGE (Logged In)
  return (
    <div>
      <h2>Campus Events</h2>

      <p role="status">Logged in as {loginUsername}</p>
      <button onClick={logout}>Log Out</button>

      {message && <p role="status">{message}</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.name}</h3>
            <p>{event.date}</p>
            <p>Tickets Available: {event.num_tickets}</p>
            <button
              onClick={() => buyTicket(event.id)}
              disabled={event.num_tickets <= 0}
            >
              Buy Ticket
            </button>
          </li>
        ))}
      </ul>

      {/* 🔥 CHATBOT UI */}
      <div style={{ marginTop: "40px" }}>
        <button onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? "Hide Assistant" : "Open Assistant"}
        </button>

        {chatOpen && (
          <div
            style={{
              width: "300px",
              height: "350px",
              border: "1px solid black",
              padding: "10px",
              marginTop: "10px",
              overflowY: "auto",
              background: "#fafafa"
            }}
          >
            <div style={{ height: "260px", overflowY: "scroll" }}>
              {chatMessages.map((m, i) => (
                <p key={i} style={{ color: m.from === "user" ? "blue" : "green" }}>
                  <strong>{m.from}:</strong> {m.text}
                </p>
              ))}
            </div>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ width: "80%" }}
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
