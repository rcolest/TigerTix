import React, { useState, useEffect, useRef } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const [confirm, setConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const llmControllerRef = useRef(null);

  const BASE = process.env.REACT_APP_API_URL;      
  const EVENTS = `${BASE}/api/events`;            
  const AUTH = `${BASE}/api`;                
  const LLM = `${BASE}/api/llm`;       

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${EVENTS}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setEvents(await res.json());
    } catch (err) {
      console.error(err);
      setMessage("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const attemptRegister = async (e) => {
    e.preventDefault();

    if (!regUsername || !regPassword) {
      setMessage("Please enter both an email and password.");
      return;
    }

    try {
      const res = await fetch(`${AUTH}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: regUsername, password: regPassword })
      });

      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Registration failed");

      setMessage("Registration successful! Please log in.");
      setShowRegister(false);
      setRegUsername("");
      setRegPassword("");
    } catch {
      setMessage("Error registering");
    }
  };

  const attemptLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Login failed");

      setLoggedIn(true);
      setMessage("Login successful!");
    } catch {
      setMessage("Login failed");
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    await fetch(`${AUTH}/logout`, {
      method: "POST",
      credentials: "include"
    });
    setLoggedIn(false);
    setMessage("Logged out");
  };

  const confirmToggle = (id, state) => {
    setConfirm(state);
    setConfirmId(state ? id : null);
    if (!state) setMessage("Ticket purchase cancelled");
  };

  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${EVENTS}/${id}/purchase`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setMessage(data.error || "Purchase failed");
        return;
      }

      setEvents((old) =>
        old.map((e) =>
          e.id === id ? { ...e, num_tickets: data.event.num_tickets } : e
        )
      );

      const ev = events.find((e) => e.id === id);
      setMessage(`Ticket purchased for ${ev.name}`);
    } catch {
      setMessage("Error purchasing ticket");
    }

    setConfirm(false);
    setConfirmId(null);
  };

  if (!loggedIn) {
    return (
      <div>
        <h2>{showRegister ? "Register" : "TigerTix Login"}</h2>
        {message && <p role="status">{message}</p>}

        {showRegister ? (
          <form onSubmit={attemptRegister}>
            <label>Email</label>
            <input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />

            <label>Password</label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />

            <button type="submit">Register</button>

            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </form>
        ) : (
          <form onSubmit={attemptLogin}>
            <label>Email</label>
            <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />

            <label>Password</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

            <button type="submit">Login</button>

            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </form>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Campus Events</h2>

      <form onSubmit={logout}>
        <p role="status">Logged in as {loginUsername}</p>
        <input type="submit" value="Log Out" />
      </form>

      {message && <p role="status">{message}</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "15px" }}>
            <h3>{event.name}</h3>
            <p>Date: {event.date}</p>
            <p>Tickets Available: {event.num_tickets}</p>

            {!confirm || confirmId !== event.id ? (
              <button
                onClick={() => confirmToggle(event.id, true)}
                disabled={event.num_tickets <= 0}
              >
                Buy Ticket
              </button>
            ) : (
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
