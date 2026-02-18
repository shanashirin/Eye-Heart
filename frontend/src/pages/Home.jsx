import React from "react";
import "./Home.css";

export default function Home() {
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
            Discover the powerful connection between the eye and the heart. Our AI-driven system analyzes retinal patterns along with clinical data to reveal early signs of cardiovascular risk — delivering fast, accurate, and completely non-invasive insights for smarter, safer healthcare decisions.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Start Analysis</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>

        <div className="hero-right">
          <img src="/eye-heart.png" alt="Eye Heart AI" />
        </div>
      </section>

      {/* STEPS SECTION */}
      {/* STEPS SECTION */}
<section className="steps">
  <h2>Your Journey to Heart Health in Three Steps</h2>

  <div className="cards">
    <div className="card">
      <i className="fa-solid fa-cloud-arrow-up icon-style"></i> {/* ICON ADDED */}
      <h3>Upload Retinal Image</h3>
      <p>Securely upload your retinal scan using our protected gateway.</p>
    </div>

    <div className="card">
      <i className="fa-solid fa-microchip icon-style"></i> {/* ICON ADDED */}
      <h3>Analyze Health Data</h3>
      <p>Our AI processes vascular patterns in seconds.</p>
    </div>

    <div className="card">
      <i className="fa-solid fa-file-medical icon-style"></i> {/* ICON ADDED */}
      <h3>Get AI Report</h3>
      <p>Receive a comprehensive cardiovascular assessment.</p>
    </div>
  </div>
</section>

      {/* CALL TO ACTION */}
      <section className="cta">
        <h2>Ready to see your future?</h2>
        <p>Join thousands taking proactive steps toward better heart health.</p>

        <div className="cta-buttons">
          <button className="primary-btn">Start Free Analysis</button>
          <button className="secondary-btn">View Sample Report</button>
        </div>
      </section>

    </div>
  );
}
