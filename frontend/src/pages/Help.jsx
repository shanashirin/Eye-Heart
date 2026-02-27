import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Help.css";

export default function Help() {
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      q: "What is a retinal fundus image?",
      a: "It is a specialized photograph of the back of your eye. You can usually obtain this from an optometrist or ophthalmologist."
    },
    {
      q: "How accurate is the AI prediction?",
      a: "Eye2Heart uses state-of-the-art deep learning models, but results should be used for screening and discussed with a medical professional."
    },
    {
      q: "Are my images stored privately?",
      a: "Yes, we prioritize data privacy. Images are processed securely and are not shared with third parties."
    }
  ];

  return (
    <div className="help-container">

      {/* HERO SECTION */}
      <section className="help-hero">
        <div className="help-left">
          <h1>
            Need <span>Help</span>? <br />
            We’re Here For <span>You</span>.
          </h1>
          <p>
            Follow these simple steps to use Eye2Heart and receive your
            AI-powered 10-year cardiovascular risk assessment.
          </p>
        </div>
      </section>

      {/* STEPS SECTION */}
      <section className="help-steps">
        <div className="section-badge">Guide</div>
        <h2>How It Works</h2>

        <div className="help-cards">
          <div className="help-card">
            <div className="step-icon">📤</div>
            <h3>Step 1</h3>
            <p>
              Upload a clear retinal fundus image in supported format (JPG/PNG).
            </p>
          </div>

          <div className="help-card">
            <div className="step-icon">📋</div>
            <h3>Step 2</h3>
            <p>
              Enter your clinical parameters carefully for accurate prediction.
            </p>
          </div>

          <div className="help-card">
            <div className="step-icon">📊</div>
            <h3>Step 3</h3>
            <p>
              Click Analyze to receive 10-year CHD prediction and Grad-CAM report.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <h2>Common Questions</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${activeFaq === index ? "active" : ""}`}
              key={index}
              onClick={() =>
                setActiveFaq(activeFaq === index ? null : index)
              }
            >
              <div className="faq-question">
                {faq.q}
                <span className="faq-toggle">
                  {activeFaq === index ? "−" : "+"}
                </span>
              </div>

              {activeFaq === index && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="help-footer-cta">
        <h3>Still have questions?</h3>
        <p>Our support team is available 24/7 to assist you.</p>

        <button
          className="contact-btn"
          onClick={() => navigate("/contact")}
        >
          Contact Support
        </button>
      </section>

    </div>
  );
}