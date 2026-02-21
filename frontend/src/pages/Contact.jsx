import React, { useState } from "react";
import axios from "axios";
import "./Contact.css";


export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:5000/api/contact",
      formData
    );

    if (res.data.success) {
      setSent(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

      setTimeout(() => setSent(false), 4000);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to send message");
  }
};
  return (
    <div className="contact-container">

      {/* HERO SECTION — mirrors .about-hero */}
      <section className="contact-hero">

        {/* LEFT — mirrors .about-left */}
        <div className="contact-left">
          <h4 className="section-tag">CONTACT EYE2HEART</h4>

          <h1>
            Let's <br />
            <span className="gradient-text">Connect</span>
          </h1>

          <p>
            Have questions about Eye2Heart? Our support team is here to assist
            you with technical help, product guidance, or cardiovascular
            screening support.
          </p>

          {/* Info items styled like feature-item */}
          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="eye-badge">✉️</div>
              <div className="info-text">
                <span className="info-label">Email Us</span>
                <span className="info-value">support@eye2heart.ai</span>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="eye-badge">📍</div>
              <div className="info-text">
                <span className="info-label">Location</span>
                <span className="info-value">Kozhikode, Kerala, India</span>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="eye-badge">🕐</div>
              <div className="info-text">
                <span className="info-label">Response Time</span>
                <span className="info-value">Within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — glass card mirrors .info-card */}
        <div className="info-card contact-form-card">

          {/* Header mirrors .eye-header */}
          <div className="eye-header">
            <div className="eye-badge">💬</div>
            <h3>Send Us a Message</h3>
          </div>

          <p className="info-desc">
            Fill out the form below and we'll get back to you as soon as
            possible with the support you need.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>

            {/* 2-col row mirrors .feature-2x2 */}
            <div className="form-2col">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Subject tags — mirrors .feature-2x2 + .feature-item */}
            <div className="form-group">
              <label>Subject</label>
              <div className="feature-2x2 subject-tags">
                {[
                  { label: "Technical Help", dot: "pink" },
                  { label: "Product Guidance", dot: "blue" },
                  { label: "CV Screening", dot: "purple" },
                  { label: "Other", dot: "cyan" },
                ].map(({ label, dot }) => (
                  <button
                    key={label}
                    type="button"
                    className={`feature-item subject-tag${formData.subject === label ? " selected" : ""}`}
                    onClick={() => setFormData({ ...formData, subject: label })}
                  >
                    <div className={`item-dot ${dot}`}></div>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                rows="4"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="primary-btn send-btn">
              {sent ? "✓ Message Sent!" : "Send Message →"}
            </button>

          </form>
        </div>
      </section>

      {/* FOOTER — identical to About */}
      <footer className="about-footer">
        <p>© 2026 Eye2Heart Analyzer. All rights reserved.</p>
        <p className="disclaimer">
          For clinical decision support only. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
}