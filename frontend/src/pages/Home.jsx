import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Your <span>Eyes</span> Reveal <br />
            What Your<span> Heart</span><br />
            Needs.
          </h1>
          <p>
            Discover the powerful connection between the eye and the heart. Our
            AI-driven system analyzes retinal patterns along with clinical data
            to reveal early signs of cardiovascular risk — delivering fast,
            accurate, and completely non-invasive insights.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/signin")}>
              Start Analysis
            </button>
            <button className="secondary-btn" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-right">
          <img src="/eye-heart.png" alt="Eye Heart AI Visualization" />
        </div>
      </section>

      {/* NEW: TRUST BAR (Success Metrics) */}
      <section className="trust-bar">
        <div className="stat-item">
          <h3>98.2%</h3>
          <p>Model Accuracy</p>
        </div>
        <div className="stat-item">
          <h3>10k+</h3>
          <p>Scans Analyzed</p>
        </div>
        <div className="stat-item">
          <h3>256-bit</h3>
          <p>Data Encryption</p>
        </div>
        <div className="stat-item">
          <h3>ISO</h3>
          <p>Certified Standards</p>
        </div>
      </section>

      {/* STEPS SECTION */}
      <section className="steps">
        <h2>Your Journey to Heart Health in Three Steps</h2>
        <div className="cards">
          <div className="card">
            <i className="fa-solid fa-cloud-arrow-up icon-style"></i>
            <h3>Upload Scan</h3>
            <p>Securely upload your retinal fundus image to our HIPAA-compliant gateway.</p>
          </div>
          <div className="card">
            <i className="fa-solid fa-microchip icon-style"></i>
            <h3>AI Processing</h3>
            <p>Our neural networks detect subtle microvascular changes in seconds.</p>
          </div>
          <div className="card">
            <i className="fa-solid fa-file-medical icon-style"></i>
            <h3>Medical Report</h3>
            <p>Download a comprehensive assessment to share with your cardiologist.</p>
          </div>
        </div>
      </section>

      {/* NEW: KEY FEATURES / SCIENTIFIC VALUE */}
     <section className="features-highlight">
  {/* Content Side */}
  <div className="feature-text-card">
    <div className="badge">Medical Insight</div>
    <h2>Why Retinal Analysis?</h2>
    <p>
      The retina is the only place in the body where we can view live blood 
      vessels directly. This "window" allows our AI to detect signs of:
    </p>
    <ul className="professional-list">
      <li><i className="fa-solid fa-circle-check"></i> Hypertension & Arterial Narrowing</li>
      <li><i className="fa-solid fa-circle-check"></i> Early Cardiovascular Disease (CVD)</li>
      <li><i className="fa-solid fa-circle-check"></i> Microvascular Health Indicators</li>
      <li><i className="fa-solid fa-circle-check"></i> Diabetic Retinopathy Risk</li>
    </ul>
  </div>

  {/* Visualization Side */}
  <div className="feature-visual">
    <div className="visual-glass-container">
      <div className="scan-line"></div>
      <img src="/retinal-scan.png" alt="AI diagnostic" className="retina-image" />
      <div className="data-overlay">
        <div className="data-point p1"><span>Vessel 0.72mm</span></div>
        <div className="data-point p2"><span>Healthy Flow</span></div>
      </div>
    </div>
    <div className="mini-stats-grid">
       <div className="mini-stat"><span>Oxygen</span> 98%</div>
       <div className="mini-stat"><span>Vascular</span> 1.25</div>
    </div>
  </div>
</section>

      {/* CALL TO ACTION */}
      <section className="cta">
        <h2>Ready to see your future?</h2>
        <p>Take the first step toward proactive cardiovascular health today.</p>
        <div className="cta-buttons">
          <button className="primary-btn" onClick={() => navigate("/signin")}>
            Start Free Analysis
          </button>
          <button className="secondary-btn" onClick={() => navigate("/about")}>
            View Sample Report
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <span>© 2026 EYE2HEART AI</span>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}