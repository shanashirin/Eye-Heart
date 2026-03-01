import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
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
        formattedDateTime: new Date(item.created_at).toLocaleString(),
        shortDate: new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })
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
  // Calculations & Trend Logic
  // ===============================
  const validRates = vitals
    .map(v => Number(v.heart_rate))
    .filter(r => !isNaN(r));

  const avgBpm = validRates.length
      ? Math.round(validRates.reduce((a, b) => a + b, 0) / validRates.length)
      : 0;

  const highRisk = vitals.filter(v => v.risk_level === "High").length;

  // Trend Analysis: Comparing last 5 vs previous 5 (or total available)
  const getTrendAnalysis = () => {
    if (validRates.length < 2) return { status: "Insufficient Data", color: "#64748b" };
    
    const recent = validRates.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previous = validRates.slice(-6, -3);
    const prevAvg = previous.length ? previous.reduce((a, b) => a + b, 0) / previous.length : validRates[0];

    const diff = recentAvg - prevAvg;
    if (Math.abs(diff) < 3) return { status: "Stable Heart Rate", color: "#059669", icon: "📊" };
    if (diff > 0) return { status: "Increasing Trend", color: "#dc2626", icon: "📈" };
    return { status: "Decreasing Trend", color: "#2563eb", icon: "📉" };
  };

  const trend = getTrendAnalysis();

  if (loading) {
    return (
      <div className="vitals-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="center-card" style={{ padding: "40px", borderRadius: "20px", background: "rgba(255,255,255,0.8)" }}>
          <div className="spinner" style={{ marginBottom: "15px" }}></div>
          <p style={{ fontWeight: "600", color: "#475569" }}>Initializing Health Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vitals-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="center-card error" style={{ padding: "30px", borderLeft: "5px solid #ef4444" }}>
          <h3 style={{ margin: 0 }}>Connection Interrupted</h3>
          <p>Unable to synchronize with medical records.</p>
        </div>
      </div>
    );
  }

  if (!vitals.length) {
    return (
      <div className="vitals-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="center-card" style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📊</div>
          <h2 style={{ fontWeight: "800", color: "#1e293b" }}>No Records Found</h2>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>Perform an AI analysis to begin tracking trends.</p>
          <button className="export-btn" onClick={() => navigate("/profile")}>
            ← Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vitals-container" style={{ padding: "40px 20px", maxWidth: "1300px", margin: "0 auto" }}>

      {/* HEADER */}
      <header className="vitals-header" style={{ marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px", margin: 0 }}>
            Cardiac Analytics Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", marginTop: "5px", fontWeight: "500" }}>
            Patient longitudinal health trends & AI-driven risk assessments
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="export-btn"
            style={{ background: "#c9c3e6", color: "#2d3154", fontWeight: "700", border: "none" }}
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>

          <button
            className="export-btn"
            style={{ fontWeight: "700" }}
            onClick={() => window.print()}
          >
            Export Medical Report
          </button>
        </div>
      </header>

      {/* TREND INSIGHTS BAR */}
      <div style={{ 
        background: "white", 
        padding: "20px 30px", 
        borderRadius: "16px", 
        marginBottom: "30px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        borderLeft: `6px solid ${trend.color}`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "24px" }}>{trend.icon}</span>
          <div>
            <h4 style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "1px" }}>Current Insight</h4>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: trend.color }}>{trend.status}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>STABILITY SCORE: </span>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>{highRisk === 0 ? "EXCELLENT" : highRisk < 3 ? "GOOD" : "ACTION REQUIRED"}</span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="vitals-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
        <div className="vital-card" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Mean Heart Rate</h3>
          <div className="vital-value" style={{ color: "#2563eb", fontSize: "42px", fontWeight: "800", margin: "10px 0" }}>
            {avgBpm} <span style={{ fontSize: "18px", color: "#94a3b8" }}>BPM</span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
            Reference Range: <span style={{ color: "#059669" }}>60–100 BPM</span>
          </p>
        </div>

        <div className="vital-card" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>High-Risk Detections</h3>
          <div className="vital-value" style={{ color: "#dc2626", fontSize: "42px", fontWeight: "800", margin: "10px 0" }}>
            {highRisk}
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
            Total elevated risk flags
          </p>
        </div>

        <div className="vital-card" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Total Assessments</h3>
          <div className="vital-value" style={{ fontSize: "42px", fontWeight: "800", margin: "10px 0", color: "#1e293b" }}>
            {vitals.length}
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
            Verified longitudinal scans
          </p>
        </div>
      </div>

      {/* LINE CHART */}
      <div
        className="trend-table"
        style={{ padding: "35px", marginBottom: "40px", height: "400px", borderRadius: "24px", background: "white" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h3 style={{ margin: 0, fontWeight: "800", fontSize: "20px" }}>Heart Rate Propagation</h3>
          <div style={{ display: "flex", gap: "20px", fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
             <span>• DATASET: Vitals_v1.0</span>
             <span>• PERIOD: {vitals[0]?.shortDate} - {vitals[vitals.length-1]?.shortDate}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={vitals}>
            <defs>
              <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Area
              type="monotone"
              dataKey="heart_rate"
              stroke="#2563eb"
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorBpm)"
              dot={{ r: 6, fill: "#2563eb", strokeWidth: 3, stroke: "#fff" }}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* HISTORY TABLE */}
      <div className="trend-table" style={{ borderRadius: "24px", overflow: "hidden", background: "white" }}>
        <div style={{ padding: "25px 35px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, fontWeight: "800", fontSize: "20px", color: "#0f172a" }}>
            Detailed Diagnostic History
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Assessment ID / Source</th>
                <th style={thStyle}>Metric (BPM)</th>
                <th style={thStyle}>Risk Status</th>
                <th style={thStyle}>AI Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #f1f5f9", transition: "0.2s" }}>
                  <td style={tdStyle}>{item.formattedDateTime}</td>
                  <td style={{ ...tdStyle, color: "#64748b", fontStyle: "italic", fontSize: "13px" }}>
                    {item.image_name || `SCAN_REF_${index + 100}`}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "700", color: "#1e293b" }}>
                    {item.heart_rate}
                  </td>
                  <td style={tdStyle}>
                    <span className={`status-badge ${item.risk_level?.toLowerCase()}`} style={badgeStyle}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "80px", height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ width: `${item.confidence}%`, height: "100%", background: "#2563eb", borderRadius: "10px" }} />
                      </div>
                      <span style={{ fontWeight: "700", fontSize: "13px", color: "#475569" }}>{item.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

const thStyle = { padding: "20px 35px", fontSize: "12px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "20px 35px", fontSize: "14px", color: "#334155" };
const badgeStyle = { padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" };