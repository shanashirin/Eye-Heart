import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ added
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();   // ✅ added

  const [summary, setSummary] = useState(null);
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, vitalsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard-summary", { headers }),
          axios.get("http://localhost:5000/api/vitals", { headers })
        ]);

        setSummary(summaryRes.data);
        setVitals(vitalsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchDashboard();
  }, []);

  if (!summary) return <div className="loading"><h3>🔄 Loading Dashboard...</h3></div>;

  return (
    <div className="dashboard">
      <header>
        <h1>📊 Patient Analytics</h1>
      </header>

      {/* ✅ Back to Profile Button */}
     <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
  <button
    onClick={() => navigate("/profile")}
    style={{
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      background: "#556175",
      color: "#fff",
      cursor: "pointer"
    }}
  >
    ← Back to Profile
  </button>

  {/* ✅ Cardiac History Button */}
  <button
    onClick={() => navigate("/history")}
    style={{
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      background: "#c0392b",
      color: "#fff",
      cursor: "pointer"
    }}
  >
    🫀 Cardiac History
  </button>
  {/* ✅ AI Doctor Chat Button */}
<button
  onClick={() => navigate("/ai-doctor")}
  style={{
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#16a085",
    color: "#fff",
    cursor: "pointer"
  }}
>
  🩺 Talk to AI Doctor
</button>
</div>

      <div className="cards">
        <div className="card">
          <h3>Total Scans</h3>
          <p>{summary.total_scans.toLocaleString()}</p>
        </div>

        <div className="card red">
          <h3>High Risk Cases</h3>
          <p>{summary.high_risk_cases}</p>
        </div>

        <div className="card blue">
          <h3>Latest Risk</h3>
          <p>{summary.latest_record ? summary.latest_record.risk_level : "N/A"}</p>
        </div>

        <div className="card green">
          <h3>Disease Detected</h3>
          <p>
            {summary.latest_record 
              ? (summary.latest_record.disease_detected ? "POSITIVE" : "NEGATIVE") 
              : "N/A"}
          </p>
        </div>
      </div>

      <h2>🫀 Scan History</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Risk %</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((item, index) => (
              <tr key={index}>
                <td style={{ fontWeight: '500' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge ${item.disease_detected === 1 ? 'high' : 'low'}`}>
                    {item.disease_detected === 1 ? "POSITIVE" : "NEGATIVE"}
                  </span>
                </td>
                <td>{item.risk_level}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{item.risk_percent}%</strong>
                  </div>
                </td>
                <td style={{ color: '#7f8c8d' }}>{item.confidence}% match</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}