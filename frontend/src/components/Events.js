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

  // 🔥 CHATBOT ADDED
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

  function Chatbot({ API, events, setEvents }) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setChat((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      // ---- STEP 1: PARSE MESSAGE ----
      const res = await fetch(`${API}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      const parsed = await res.json();

      if (parsed.intent === "unknown") {
        setChat((prev) => [
          ...prev,
          { from: "bot", text: parsed.response }
        ]);
        setIsLoading(false);
        return;
      }

      // ---- STEP 2: CONFIRM BOOKING ----
      const confirmRes = await fetch(`${API}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: parsed.event,
          tickets: parsed.tickets
        })
      });

      const confirm = await confirmRes.json();

      if (!confirmRes.ok) {
        setChat((prev) => [
          ...prev,
          { from: "bot", text: confirm.error ?? "Booking failed." }
        ]);
        setIsLoading(false);
        return;
      }

      // Update event list UI
      const updated = events.map(e =>
        e.name === parsed.event
          ? { ...e, num_tickets: confirm.result.num_tickets }
          : e
      );
      setEvents(updated);

      setChat((prev) => [
        ...prev,
        { from: "bot", text: confirm.message }
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { from: "bot", text: "Error contacting LLM server." }
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div>
      <div style={{ minHeight: "150px", padding: "10px", background: "#fafafa", marginBottom: "10px" }}>
        {chat.map((c, idx) => (
          <p key={idx}><strong>{c.from === "user" ? "You" : "AI"}:</strong> {c.text}</p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Ask about events…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage} disabled={isLoading}>
        {isLoading ? "..." : "Send"}
      </button>
    </div>
  );
}


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

  // 🔥 CHATBOT: SEND MESSAGE
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    // Add the user message
    setChatMessages((prev) => [...prev, { from: "user", text: chatInput }]);

    const messageToSend = chatInput;
    setChatInput("");

    try {
      const res = await fetch(`${API}/llm/ask`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend })
      });

      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply || "No response" }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
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

    {/* ---------- CHATBOT ---------- */}
    <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #ccc" }}>
      <h3>Ask TigerTix AI</h3>

      <Chatbot API={API} events={events} setEvents={setEvents} />
    </div>
  </div>
);
