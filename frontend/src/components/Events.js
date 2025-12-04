import React, { useState, useEffect, useRef } from "react";

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

  // --------------------------
  // Load events
  // --------------------------
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API}/api/events`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setEvents([]);
        setMessage(data.error || "Failed to load events");
        return;
      }
      setEvents(data);
    } catch (err) {
      console.error("fetchEvents error:", err);
      setMessage("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --------------------------
  // Login
  // --------------------------
  const attemptLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      setLoggedIn(true);
      setMessage("Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Error logging in");
    }
  };

  // --------------------------
  // Register
  // --------------------------
  const attemptRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, password: regPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Registration failed");
        return;
      }

      setMessage("Registration successful! Please log in.");
      setShowRegister(false);
      setRegUsername("");
      setRegPassword("");
    } catch (err) {
      console.error("Register error:", err);
      setMessage("Error registering");
    }
  };

  // --------------------------
  // Logout
  // --------------------------
  const logout = async () => {
    try {
      await fetch(`${API}/api/logout`, {
        method: "POST",
        credentials: "include"
      });
      setLoggedIn(false);
      setLoginUsername("");
      setMessage("Logged out");
    } catch (err) {
      setMessage("Logout failed");
    }
  };

  // --------------------------
  // Buy Ticket
  // --------------------------
  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${API}/api/events/${id}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Purchase failed");
        return;
      }

      // Update event list
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, num_tickets: data.event.num_tickets } : e
        )
      );

      setMessage(`Ticket purchased for ${data.event.name}`);
    } catch (err) {
      console.error("buyTicket error:", err);
      setMessage("Error purchasing ticket");
    }
  };

  // --------------------------
  // UI RENDERING
  // --------------------------

  if (!loggedIn) {
    return (
      <div>
        <h2>{showRegister ? "Register" : "Login"}</h2>
        {message && <p role="status">{message}</p>}

        {showRegister ? (
          <form onSubmit={attemptRegister}>
            <label>Email</label>
            <input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />

            <label>Password</label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />

            <button type="submit">Register</button>

            <p>Already have an account?</p>
            <button type="button" onClick={() => setShowRegister(false)}>
              Go to Login
            </button>
          </form>
        ) : (
          <form onSubmit={attemptLogin}>
            <label>Email</label>
            <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />

            <label>Password</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

            <button type="submit">Login</button>

            <p>Don't have an account?</p>
            <button type="button" onClick={() => setShowRegister(true)}>
              Register
            </button>
          </form>
        )}
      </div>
    );
  }

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
    </div>
  );
}
