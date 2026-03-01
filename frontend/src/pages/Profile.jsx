import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Mail, ShieldCheck, Activity, 
  LayoutDashboard, History, Scan, LineChart, LogOut, Plus 
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState({ user: null, vitals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userRes, vitalsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/profile", config),
          axios.get("http://localhost:5000/api/vitals", config)
        ]);
        
        setData({ user: userRes.data, vitals: vitalsRes.data });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to sync profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]); // Ensure this closing is exactly like this

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Syncing Profile...</p></div>;
  if (error) return <div className="error-screen"><h3>{error}</h3></div>;

  const latestVital = data.vitals?.[0];

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

        <nav className="nav-group">
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={18} style={{marginRight: '10px'}} /> Dashboard
          </div>
          <div className="nav-item active">
            <User size={18} style={{marginRight: '10px'}} /> Profile
          </div>
          <div className="nav-item" onClick={() => navigate("/history")}>
            <History size={18} style={{marginRight: '10px'}} /> Cardiac History
          </div>
          <div className="nav-item" onClick={() => navigate("/scans")}>
            <Scan size={18} style={{marginRight: '10px'}} /> Optical Scan Log
          </div>
          <div className="nav-item" onClick={() => navigate("/vitals")}>
            <LineChart size={18} style={{marginRight: '10px'}} /> Vitals Trends
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-text-btn" onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="main-panel">
        <header className="panel-header">
          <div>
            <h1>Account Overview</h1>
            <p>Secure health profile & system insights</p>
          </div>
          <button className="gradient-btn" onClick={() => navigate("/analyze")}>
            <Plus size={18} /> New Analysis
          </button>
        </header>

        {/* STAT TILES */}
        <section className="profile-stats">
          <div className="stat-tile">
            <label><User size={12} /> Full Name</label>
            <div className="stat-content">{data.user?.name}</div>
          </div>

          <div className="stat-tile">
            <label><Mail size={12} /> Email</label>
            <div className="stat-content">{data.user?.email}</div>
          </div>

          <div className="stat-tile">
            <label><ShieldCheck size={12} /> Security</label>
            <div className="stat-content">
              <span className="status-dot"></span> Protected
            </div>
          </div>
        </section>

        {/* RECENT VITAL */}
        <section className="activity-panel">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <Activity size={20} color="#ff7eb3" />
            <h3 style={{margin: 0}}>Latest Biometric Record</h3>
          </div>

          {latestVital ? (
            <div className="activity-row">
              <div className="activity-desc">
                <div style={{marginBottom: '8px'}}>
                  <strong>Risk Level:</strong> 
                  <span style={{marginLeft: '8px', color: latestVital.risk_level === 'High' ? '#ff7675' : '#55efc4'}}>
                    {latestVital.risk_level}
                  </span>
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong>Heart Rate:</strong> {latestVital.heart_rate} BPM
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong>AI Confidence:</strong> {latestVital.confidence}%
                </div>
                <span style={{fontSize: '0.75rem', color: '#b2bec3', marginTop: '10px'}}>
                  Recorded on: {new Date(latestVital.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              No biometric records found.<br />Run your first analysis to see data here.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}