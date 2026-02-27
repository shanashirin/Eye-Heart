import React from "react";
import { useNavigate } from "react-router-dom"; // Import the hook
import "./About.css";

export default function About() {
  const navigate = useNavigate(); // Initialize navigation

  return (
    <div className="about-container">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-left">
          <h4 className="section-tag">ABOUT EYE2HEART</h4>
          <h1>
            Transforming <br />
            Cardiovascular <br />
            Diagnostics
          </h1>

          <p>
            Eye2Heart is an AI-powered retinal analysis platform designed
            to detect early cardiovascular risk using advanced deep learning
            and microvascular pattern recognition.
          </p>

          <button 
            className="primary-btn" 
            onClick={() => navigate("/signin")} // Redirects to your sign-in route
          >
            Start Your Assessment →
          </button>
        </div>

        {/* 2x2 FEATURE CARD */}
        <div className="info-card">
          <div className="eye-header">
            <div className="eye-badge">👁️</div>
            <h3>The Retina Reflects the Heart</h3>
          </div>
          
          <p className="info-desc">
            The retinal microvasculature mirrors systemic cardiovascular conditions. 
            Our AI identifies structural biomarkers to classify risk levels.
          </p>

          <div className="feature-2x2">
            <div className="feature-item">
              <div className="item-dot pink"></div>
              <span>Arterial Narrowing</span>
            </div>
            <div className="feature-item">
              <div className="item-dot blue"></div>
              <span>AV Nicking</span>
            </div>
            <div className="feature-item">
              <div className="item-dot purple"></div>
              <span>Vessel Tortuosity</span>
            </div>
            <div className="feature-item">
              <div className="item-dot cyan"></div>
              <span>Microvascular Damage</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="process-section">
        <h2>How Eye2Heart Works</h2>
        <div className="process-grid">
          <div className="process-card">
            <div className="process-icon">📷</div>
            <h4>1. Retinal Imaging</h4>
            <p>
              High-resolution retinal fundus images are captured
              non-invasively using standard ophthalmic imaging devices.
            </p>
          </div>

          <div className="process-card">
            <div className="process-icon">🧠</div>
            <h4>2. AI Deep Analysis</h4>
            <p>
              Convolutional Neural Networks analyze vessel morphology,
              detect abnormalities, and extract predictive biomarkers.
            </p>
          </div>

          <div className="process-card">
            <div className="process-icon">📊</div>
            <h4>3. Risk Classification</h4>
            <p>
              The system classifies cardiovascular risk into
              Low, Medium, or High with confidence metrics.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <p>© 2026 Eye2Heart Analyzer. All rights reserved.</p>
        <p className="disclaimer">
          For clinical decision support only. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
}