import React from "react";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-container">

      {/* HERO SECTION */}
      <section className="contact-hero">
        <div className="contact-left">
          <h1>
            Get In <span>Touch</span>
          </h1>
          <p>
            Have questions about Eye2Heart? Our support team is here to help you
            with anything you need.
          </p>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section className="contact-section">
        <div className="section-badge">Support</div>
        <h2>Send Us a Message</h2>

        <div className="contact-card">
          <form className="contact-form">

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea rows="5" placeholder="Write your message..."></textarea>
            </div>

            <button type="submit" className="contact-btn">
              Send Message
            </button>

          </form>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="contact-footer">
        <h3>We typically respond within 24 hours.</h3>
        <p>Your health matters. We're here to support you.</p>
      </section>

    </div>
  );
}