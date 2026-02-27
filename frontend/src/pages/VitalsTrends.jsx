import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./VitalsTrends.css";

export default function VitalsTrends() {

  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    axios.get("http://localhost:5000/api/vitals", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : [];

      const formattedData = data.map(item => ({
        ...item,
        displayDate: item.date
          ? new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })
          : "N/A"
      }));

      setVitals(formattedData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Vitals Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        setError(true);
      }
      setLoading(false);
    });

  }, [navigate]);

  // ===============================
  // Loading State
  // ===============================
  if (loading) {
    return (
      <div className="vitals-container">
        <div className="center-card">Analyzing Health Data...</div>
      </div>
    );
  }

  // ===============================
  // Error State
  // ===============================
  if (error) {
    return (
      <div className="vitals-container">
        <div className="center-card error">
          Unable to load vitals data
        </div>
      </div>
    );
  }

  // ===============================
  // No Data State
  // ===============================
  if (!vitals.length) {
    return (
      <div className="vitals-container">
        <div className="center-card">
          <h2>No Vital Data Available</h2>
          <p>You haven’t performed any analysis yet.</p>
          <button
            className="export-btn"
            style={{ marginTop: "20px" }}
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // Calculations
  // ===============================
  const validRates = vitals
    .map(v => Number(v.heart_rate))
    .filter(r => !isNaN(r));

  const avgBpm =
    validRates.length
      ? Math.round(validRates.reduce((a, b) => a + b, 0) / validRates.length)
      : 0;

  const highRisk =
    vitals.filter(v => v.risk_level === "High").length;

  return (
    <div className="vitals-container">

      {/* HEADER */}
      <header className="vitals-header">
        <div>
          <h1>Cardiac Analytics Dashboard</h1>
          <p style={{ color: "#64748b" }}>
            Patient health trends and AI-driven risk assessments
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="export-btn"
            style={{ background: "#c9c3e6", color: "#2d3154" }}
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>

          <button
            className="export-btn"
            onClick={() => window.print()}
          >
            Export Report
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="vitals-cards">
        <div className="vital-card">
          <h3>Average BPM</h3>
          <div className="vital-value" style={{ color: "#2563eb" }}>
            {avgBpm}
          </div>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Normal range: 60–100
          </p>
        </div>

        <div className="vital-card">
          <h3>High Risk Alerts</h3>
          <div className="vital-value" style={{ color: "#dc2626" }}>
            {highRisk}
          </div>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Elevated risk detections
          </p>
        </div>

        <div className="vital-card">
          <h3>Total Scans</h3>
          <div className="vital-value">
            {vitals.length}
          </div>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Recorded analyses
          </p>
        </div>
      </div>

      {/* LINE CHART */}
      <div
        className="trend-table"
        style={{ padding: "20px", marginBottom: "30px", height: "300px" }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          Heart Rate Trend Line
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vitals}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="heart_rate"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HISTORY TABLE */}
      <div className="trend-table">
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0 }}>
            Detailed Prediction History
          </h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Source Image</th>
              <th>Heart Rate</th>
              <th>Risk Level</th>
              <th>AI Confidence</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((item, index) => (
              <tr key={index}>
                <td>{item.date || "N/A"}</td>
                <td style={{ color: "#64748b", fontStyle: "italic" }}>
                  {item.image_name}
                </td>
                <td style={{ fontWeight: "600" }}>
                  {item.heart_rate} BPM
                </td>
                <td>
                  <span
                    className={`status-badge ${item.risk_level?.toLowerCase()}`}
                  >
                    {item.risk_level}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "6px",
                        background: "#e2e8f0",
                        borderRadius: "3px"
                      }}
                    >
                      <div
                        style={{
                          width: `${item.confidence}%`,
                          height: "100%",
                          background: "#2563eb",
                          borderRadius: "3px"
                        }}
                      />
                    </div>
                    {item.confidence}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}