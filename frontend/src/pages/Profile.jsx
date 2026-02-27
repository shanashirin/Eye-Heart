import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

export default function Profile() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  // ===============================
  // FETCH USER PROFILE
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser(res.data);
      setError(false);
    })
    .catch(err => {
      console.error("Profile Error:", err);
      setError(true);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    });

  }, [navigate]);

  // ===============================
  // LOGOUT FUNCTION
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  // ===============================
  // ERROR STATE
  // ===============================
  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-badge">!</div>
          <h3>System Offline</h3>
          <p>Unable to sync with Eye2Heart health servers.</p>
          <button
            className="gradient-btn"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // LOADING STATE
  // ===============================
  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  // ===============================
  // MAIN UI
  // ===============================
  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="logo-box">💙</div>
          <div className="brand-text">
            <h3>Eye2Heart</h3>
            <span>BIOMETRIC MONITOR</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-group-label">Overview</div>

          <div
            className="nav-item"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            Health Dashboard
          </div>

          <div className="nav-item active">
            User Profile
          </div>

          <div className="nav-group-label">Analysis</div>

          <div
            className="nav-item"
            onClick={() => navigate("/history")}
            style={{ cursor: "pointer" }}
          >
            Cardiac History
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/scans")}
            style={{ cursor: "pointer" }}
          >
            Optical Scan Log
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/vitals")}
            style={{ cursor: "pointer" }}
          >
            Vitals Trends
          </div>

        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-text-btn"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>

      </aside>


      {/* MAIN PANEL */}
      <main className="main-panel">

        {/* HEADER */}
        <header className="panel-header">
          <div className="header-info">
            <h1>Account Settings</h1>
            <p>Manage your health profile and personal data</p>
          </div>

          <button
            className="gradient-btn"
            onClick={() => navigate("/analyze")}
          >
            + New Analysis
          </button>
        </header>

        {/* PROFILE INFO */}
        <section className="profile-stats">

          <div className="stat-tile">
            <label>Name</label>
            <div className="stat-content">
              {user.name}
            </div>
          </div>

          <div className="stat-tile">
            <label>Email Address</label>
            <div className="stat-content">
              {user.email}
            </div>
          </div>

          <div className="stat-tile">
            <label>Security Status</label>
            <div className="stat-content">
              <span className="status-dot"></span> Protected
            </div>
          </div>

        </section>

        {/* ACTIVITY SECTION */}
        <section className="activity-panel">

          <div className="panel-inner-header">
            <h3>Recent Biometric Logs</h3>
          </div>

          <div className="activity-row">
            <div className="activity-icon heart">❤️</div>
            <div className="activity-desc">
              <strong>Heart Rate Consistency</strong>
              <span>Last analyzed: 2 hours ago</span>
            </div>
            <div className="activity-value">72 BPM</div>
          </div>

          <div className="activity-row">
            <div className="activity-icon eye">👁️</div>
            <div className="activity-desc">
              <strong>Ocular Strain Index</strong>
              <span>Last analyzed: Yesterday</span>
            </div>
            <div className="activity-value">Low</div>
          </div>

        </section>

      </main>
    </div>
  );
}