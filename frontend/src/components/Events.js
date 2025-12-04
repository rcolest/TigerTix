import React, { useState, useEffect, useRef } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(-1);
  const [usingChatbot, setUsingChatbot] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);

  const [awaitingVoiceConfirm, setAwaitingVoiceConfirm] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const llmControllerRef = useRef(null);
  const llmUrl = "https://tigertix-0qva.onrender.com/api/llm";
  const clientUrl = "https://tigertix-0qva.onrender.com/api";

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, { credentials: "include" });
      if (!res.ok) {
        setMessage("Failed to load events");
        setEvents([]);
        return;
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setMessage("Error fetching events");
      setEvents([]);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const confirmToggle = (id, state) => {
    setConfirm(state);
    setConfirmId(state ? id : -1);
    if (!state) setMessage("Ticket purchase cancelled");
  };

  const attemptRegister = async (e) => {
    e.preventDefault();
    const username = regUsername;
    const password = regPassword;
    if (!username || !password) {
      setMessage("Please enter both an email and a password.");
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Error registering");
        return;
      }
      setMessage("Registration successful! Please log in.");
      setShowRegister(false);
      setRegUsername("");
      setRegPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Error registering");
    }
  };

  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${clientUrl}/${id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`${data.error}`);
        return;
      }
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, num_tickets: data.event.num_tickets } : e))
      );
      setMessage(`Ticket purchased for ${events.find((e) => e.id === id).name}`);
    } catch (err) {
      console.error(err);
      setMessage("Error purchasing ticket");
    }
    setConfirm(false);
  };

  const triggerChatbot = async (e) => {
    e.preventDefault();
    if (!chatInput) return;
    const lower = chatInput.toLowerCase().trim();
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon"];
    if (greetings.some(g => lower.startsWith(g))) {
      setMessage("Hello! I’m your ticket assistant. You can ask me to book tickets for campus events.");
      return;
    }
    const showEventsKeywords = ["list events", "show events", "available events", "events"];
    if (showEventsKeywords.some(k => lower.includes(k))) {
      setMessage("Here are the available events:");
      fetchEvents();
      return;
    }
    if (lower.includes("help")) {
      setMessage("You can type things like 'Book two tickets for Jazz Night' or 'Show events'.");
      return;
    }
    try {
      if (llmControllerRef.current) llmControllerRef.current.abort();
      llmControllerRef.current = new AbortController();
      const res = await fetch(`${llmUrl}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
        signal: llmControllerRef.current.signal,
      });
      llmControllerRef.current = null;
      const data = await res.json();
      if (data.error) { setMessage(`${data.error}`); return; }
      if (data.intent === "book") {
        const eventObj = events.find((e) => e.name.toLowerCase() === data.event.toLowerCase());
        if (!eventObj) { setMessage(`Event "${data.event}" not found`); return; }
        setPendingBooking({ event: eventObj.name, tickets: data.tickets });
        setConfirmId(eventObj.id);
        setConfirm(true);
        setMessage(`I can book ${data.tickets} ticket(s) for ${eventObj.name}. Say "yes" to confirm or "no" to cancel.`);
        setAwaitingVoiceConfirm(true);
      } else {
        setMessage(`${data.response || "I didn't understand that."}`);
      }
    } catch (err) {
      console.error("Error with chatbot:", err);
      setMessage("Error with chatbot");
    }
    setUsingChatbot(false);
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
      if (result.error) setMessage(`${result.error}`);
      else setMessage(result.message || "Booking complete!");
      setPendingBooking(null);
      setConfirm(false);
      setConfirmId(-1);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("Booking failed");
      setPendingBooking(null);
      setConfirm(false);
      setConfirmId(-1);
    }
  };

  const startVoiceCapture = () => {
    setChatHistory([]);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support voice input.");
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    const beep = new Audio("/beep.mp3");
    beep.play();
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      if (awaitingVoiceConfirm) {
        if (transcript === "yes") { confirmLLMBooking(); setAwaitingVoiceConfirm(false); }
        else if (transcript === "no") { confirmToggle(confirmId, false); setPendingBooking(null); setAwaitingVoiceConfirm(false); }
        else { setMessage(`Voice not recognized. Please say "yes" or "no".`); startVoiceCapture(); }
      } else {
        setChatHistory(prev => [...prev, { from: "user", text: transcript }]);
        setChatInput(transcript);
        triggerChatbotVoice(transcript);
      }
    };
    recognition.onerror = (event) => { console.error("Voice recognition error:", event.error); setMessage("Voice recognition failed"); };
  };

  const triggerChatbotVoice = async (text) => {
    const lower = text.toLowerCase().trim();
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon"];
    if (greetings.some(g => lower.startsWith(g))) { setMessage("Hello! I’m your ticket assistant. You can ask me to book tickets for campus events."); return; }
    const showEventsKeywords = ["list events", "show events", "available events", "events"];
    if (showEventsKeywords.some(k => lower.includes(k))) { setMessage("Here are the available events:"); fetchEvents(); return; }
    if (lower.includes("help")) { setMessage("You can type things like 'Book two tickets for Jazz Night' or 'Show events'."); return; }
    try {
      if (llmControllerRef.current) llmControllerRef.current.abort();
      llmControllerRef.current = new AbortController();
      const res = await fetch(`${llmUrl}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: llmControllerRef.current.signal
      });
      llmControllerRef.current = null;
      const data = await res.json();
      if (data.error) return setMessage(`${data.error}`);
      if (data.intent === "book") {
        const eventObj = events.find((e) => e.name.toLowerCase() === data.event.toLowerCase());
        if (!eventObj) return setMessage(`Event "${data.event}" not found`);
        setPendingBooking({ event: eventObj.name, tickets: data.tickets });
        setConfirmId(eventObj.id);
        setConfirm(true);
        setMessage(`I can book ${data.tickets} ticket(s) for ${eventObj.name}. Say "yes" to confirm or "no" to cancel.`);
        setAwaitingVoiceConfirm(true);
      } else {
        const reply = data.response || "I didn't understand that.";
        setMessage(reply);
        setChatHistory(prev => [...prev, { from: "bot", text: reply }]);
      }
    } catch (err) { console.error("Error with chatbot:", err); setMessage("Error with chatbot"); }
    setUsingChatbot(false);
  };

  const attemptLogin = async (e) => {
    e.preventDefault();
    const username = loginUsername;
    const password = loginPassword;
    if (!username || !password) { setMessage("Please enter a username and password"); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Login failed"); return; }
      setLoggedIn(true);
      setLoginUsername(username);
      setMessage("Login successful!");
    } catch (err) { console.error(err); setMessage("Error logging in"); }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, { method: "POST", credentials: "include" });
      setLoggedIn(false);
      setLoginUsername("");
      setMessage("Logged out");
    } catch (err) { console.error("Logout failed:", err); setMessage("Logout failed"); }
  };

  if (!loggedIn) {
    return (
      <div>
        <h2>{showRegister ? "Register" : "TigerTix Login"}</h2>
        {message && <p role="status">{message}</p>}
        {showRegister ? (
          <form onSubmit={attemptRegister}>
            <label htmlFor="email">Email</label>
            <input type="text" id="email" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
            <label htmlFor="pass">Password</label>
            <input id="pass" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            <button type="submit">Register</button>
            <p>Already have an account? <button type="button" onClick={() => setShowRegister(false)}>Login</button></p>
          </form>
        ) : (
          <form onSubmit={attemptLogin}>
            <label htmlFor="email">Email</label>
            <input id="email" type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
            <label htmlFor="pass">Password</label>
            <input id="pass" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            <label htmlFor="submission">Login Button</label>
            <button id="submission" type="submit">Login</button>
            <p>Don't have an account? <button type="button" onClick={() => setShowRegister(true)}>Register</button></p>
          </form>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Campus Events</h2>
      {loginUsername && (
        <form name="loggedin" onSubmit={logout}>
          <p role="status">{`Logged in as ${loginUsername}`}</p>
          <input type="submit" name="submission" value="Log Out" />
        </form>
      )}
      {!usingChatbot ? (
        <>
          <button onClick={() => { setChatHistory([]); setUsingChatbot(true); }}>Try our chatbot!</button>
          <button onClick={startVoiceCapture} aria-label="Use voice input" style={{ marginLeft: "10px" }}>🎤 Speak</button>
        </>
      ) : (
        <button onClick={startVoiceCapture} aria-label="Use voice input" style={{ marginLeft: "10px" }}>🎤 Speak</button>
      )}
      {usingChatbot && (
        <form name="chatbotBox" onSubmit={triggerChatbot}>
          <label htmlFor="message">Enter input:</label>
          <input type="text" id="message" name="message" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
          <label htmlFor="submission">Submit</label>
          <input id="submission" name="submission" type="submit" value="Submit" />
        </form>
      )}
      {message && <p role="status">{message}</p>}
      {pendingBooking && (
        <div>
          <button onClick={() => { confirmLLMBooking(); setAwaitingVoiceConfirm(false); }} aria-label="Confirm LLM booking">✅ Confirm Booking</button>
          <button onClick={() => { confirmToggle(confirmId, false); setPendingBooking(null); setAwaitingVoiceConfirm(false); }} aria-label="Cancel LLM booking">❌ Cancel</button>
        </div>
      )}
      <div style={{ marginTop: "15px" }}>
        {chatHistory.map((m, i) => (
          <p key={i} style={{ fontWeight: m.from === "user" ? "bold" : "normal" }}>
            {m.from === "user" ? "🧑 You: " : "🤖 Bot: "}
            {m.text}
          </p>
        ))}
      </div>
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "10px" }}>
            <h3>{event.name}</h3>
            <p>Date: {event.date}</p>
            <p>Tickets Available: {event.num_tickets}</p>
            {!(confirm && confirmId === event.id) && (
              <button onClick={() => confirmToggle(event.id, true)} disabled={event.num_tickets <= 0}>Buy Ticket</button>
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
