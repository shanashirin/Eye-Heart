import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AIDoctorChat.css";

export default function AIDoctorChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
  if (!message.trim()) return;

  const token = localStorage.getItem("token");
  const userText = message;

  setChat((prev) => [
    ...prev,
    { sender: "user", text: userText },
  ]);

  setMessage("");
  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/chat",
      { message: userText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setChat((prev) => [
      ...prev,
      { sender: "bot", text: res.data.reply },
    ]);

  } catch (err) {
    console.error("Chat Error:", err);

    setChat((prev) => [
      ...prev,
      { sender: "bot", text: "Error connecting to AI Doctor." },
    ]);
  }

  setLoading(false);
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <h2>🩺 AI Cardiologist Assistant</h2>

      <div className="chat-box">
        {chat.map((c, index) => (
          <div
            key={index}
            className={`chat-message ${
              c.sender === "user" ? "user" : "bot"
            }`}
          >
            {c.text}
          </div>
        ))}

        {loading && <div className="chat-message bot">Typing...</div>}

        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask about your heart health..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <p className="disclaimer">
        ⚠️ This AI provides guidance only. Consult a certified doctor for
        medical decisions.
      </p>
    </div>
  );
}