import React, { useState, useEffect, useRef } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(-1);
  const [usingChatbot, setUsingChatbot] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);

  const [awaitingVoiceConfirm, setAwaitingVoiceConfirm] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);

  const llmControllerRef = useRef(null);

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
      setMessage("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 1000);

    if (message) {
      speakMessage(message);
    }

    return () => clearInterval(interval);
  }, [message]);

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
    if (!state) setMessage("Ticket purchase cancelled");
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

  /*
  * Sends the user’s chatbot input to the LLM or handles simple keyword-based commands.
  * INPUTS:
  * e - The form submission event (used to prevent default form behavior).
  * RETURNS: None directly; updates component state with messages, pending bookings, and confirmation flags.
  * Handles:
  *  - Greetings (e.g., "hi", "hello") by showing a welcome message.
  *  - Event listing requests (e.g., "show events") by refreshing and displaying available events.
  *  - Help requests by showing usage instructions.
  *  - Booking requests via the LLM endpoint, setting pending bookings and prompting for confirmation.
  *  - Errors in fetching or parsing the LLM response.
  */
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
      if (llmControllerRef.current) {
        llmControllerRef.current.abort(); 
      }
      llmControllerRef.current = new AbortController();

      const res = await fetch(`${llmUrl}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
        signal: llmControllerRef.current.signal, 
      });

    llmControllerRef.current = null; 

      const data = await res.json();

      if (data.error) {
        setMessage(`${data.error}`);
        return;
      }

      if (data.intent === "book") {
        const eventObj = events.find((e) => e.name.toLowerCase() === data.event.toLowerCase());
        if (!eventObj) {
          setMessage(`Event "${data.event}" not found`);
          return;
        }

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
  };

  /*
  * Confirms a pending LLM-initiated ticket booking and updates the backend.
  * INPUTS: None directly; relies on the `pendingBooking` state.
  * RETURNS: None directly; updates component state with messages, clears pending booking, resets confirmation flags, and refreshes the event list.
  * Handles:
  *  - Sending the pending booking to the LLM confirmation endpoint.
  *  - Displaying success or error messages based on the response.
  *  - Clearing pending booking and confirmation UI state.
  *  - Refreshing available events to reflect the updated ticket counts.
  */
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
        setMessage(`${result.error}`);
      } else {
        setMessage(result.message || "Booking complete!");
      }

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

  if (loading) return <div>Loading events...</div>;

  /*
  * Captures voice input from the user and either transcribes it to the chatbot
  * or listens for voice confirmation of a pending LLM-initiated ticket booking.
  * INPUTS: None directly; triggered by a button click.
  * RETURNS: None directly; updates component state with messages, pending bookings,
  *          confirmation flags, and chat input.
  * Handles:
  *  - Playing a short beep before recording.
  *  - Transcribing spoken words into text and populating the chat input.
  *  - Sending transcribed text to the LLM chatbot.
  *  - Handling voice confirmation for pending bookings ("yes" to confirm, "no" to cancel).
  *  - Re-prompting if voice input is not recognized.
  *  - Reporting errors if voice recognition fails.
  */
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

    /*
    * Handles the speech recognition result event.
    * INPUTS:
    *  event - The SpeechRecognition result event containing detected transcript(s).
    * RETURNS: None directly; triggers chatbot processing or confirmation workflow.
    * Handles:
    *  - Extracting the user's spoken transcript from recognition results.
    *  - If awaiting booking confirmation, checks for "yes" or "no" responses.
    *  - If not in confirmation mode, stores the voice transcript and triggers LLM processing.
    *  - Updates chat history so visually impaired users receive confirmation of interpreted speech.
    *  - Falls back to re-prompting voice input if the response is unclear.
    */
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();

      if (awaitingVoiceConfirm) {
        if (transcript === "yes") {
          confirmLLMBooking();
          setAwaitingVoiceConfirm(false);
        } else if (transcript === "no") {
          confirmToggle(confirmId, false);
          setPendingBooking(null);
          setAwaitingVoiceConfirm(false);
        } else {
          setMessage(`Voice not recognized. Please say "yes" or "no".`);
          startVoiceCapture();
        }
      } else {
        setChatHistory(prev => [...prev, { from: "user", text: transcript }]);
        setChatInput(transcript);
        triggerChatbotVoice(transcript);
      }

    };

    /*
    * Handles speech recognition errors.
    * INPUTS:
    *  event - The SpeechRecognition error event object.
    * RETURNS: None directly; sets an error message for the user.
    * Handles:
    *  - Logging speech recognition errors to the console for debugging.
    *  - Informing the user that voice recognition failed and prompting retry.
    * Accessibility Goal:
    *  - Ensures visually impaired users receive clear feedback when speech input fails.
    */
    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setMessage("Voice recognition failed");
    };
  };

  /*
  * Sends spoken user input to the LLM and processes the response.
  * INPUTS:
  *  text - The transcribed text from the user's speech input.
  * RETURNS: None directly; updates chat history, pending bookings, and messages.
  * Handles:
  *  - Detecting simple voice commands such as greetings and event listing requests.
  *  - Sending natural-language voice input to the LLM `/parse` endpoint.
  *  - Displaying and speaking the LLM response for accessibility.
  *  - Detecting booking intent, prompting for voice confirmation, and preventing auto-booking.
  *  - Updating chat history to show both user and bot messages.
  * Accessibility Focus:
  *  - Supports non-visual interaction and reduces cognitive load by pairing text and speech output.
  */
  const triggerChatbotVoice = async (text) => {
    const lower = text.toLowerCase().trim();

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
    } catch (err) {
      console.error("Error with chatbot:", err);
      setMessage("Error with chatbot");
    }
  };

  /*
  * Converts text responses into spoken audio for accessible interaction.
  * INPUTS:
  *  text - The string to be spoken aloud to the user.
  * RETURNS: None; triggers Web Speech Synthesis to speak the message.
  * Handles:
  *  - Creating a SpeechSynthesisUtterance with chosen language, pitch, and rate.
  *  - Ensuring clear auditory feedback for users who cannot rely on visual UI.
  * Accessibility Focus:
  *  - Provides auditory output to support visually impaired users and reduce cognitive effort.
  */
  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };


  return (
    <div>
      <h2>Campus Events</h2>

      {!usingChatbot && (
        <>
          <button
            onClick={() => {
              setChatHistory([]);
              setUsingChatbot(true);
            }}
          >
            Try our chatbot!
          </button>
          <button onClick={startVoiceCapture} aria-label="Use voice input" style={{ marginLeft: "10px" }}>
            🎤 Speak
          </button>
        </>
      )}


      {usingChatbot && (
        <form name="chatbotBox" onSubmit={triggerChatbot}>
          <label for="message">Enter input:</label>
          <input
            type="text"
            id="message"
            name="message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <label for="submission">Submit</label>
          <input id="submission" name="submission" type="submit" value="Submit" />
        </form>
      )}

      {message && <p role="status">{message}</p>}

      {pendingBooking && (
        <div>
          <button
            onClick={() => {
              confirmLLMBooking();
              setAwaitingVoiceConfirm(false); // stop waiting for voice
            }}
            aria-label="Confirm LLM booking"
          >
            ✅ Confirm Booking
          </button>
          <button
            onClick={() => {
              confirmToggle(confirmId, false);
              setPendingBooking(null);
              setAwaitingVoiceConfirm(false); // stop waiting for voice
            }}
            aria-label="Cancel LLM booking"
          >
            ❌ Cancel
          </button>
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