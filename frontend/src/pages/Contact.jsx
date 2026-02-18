import React from "react";

export default function Contact() {
  return (
    <div className="page-container">
      <h1>Contact Us</h1>

      <p>Email: support@eye2heart.ai</p>
      <p>Phone: +91 98765 43210</p>

      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="4" required />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}
