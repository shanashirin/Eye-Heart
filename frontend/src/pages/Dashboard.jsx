import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {

  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:5000/api/vitals", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setVitals(res.data);
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => {
      setLoading(false);
    });

  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>
      
      <h2 style={{ marginBottom: "30px" }}>
        Prediction History Dashboard
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : vitals.length === 0 ? (
        <p>No prediction history found.</p>
      ) : (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          overflowX: "auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={th}>Date & Time</th>
                <th style={th}>Image</th>
                <th style={th}>Disease</th>
                <th style={th}>Risk Level</th>
                <th style={th}>Risk %</th>
                <th style={th}>Confidence</th>
                <th style={th}>Heart Rate</th>
              </tr>
            </thead>

            <tbody>
              {vitals.map((item, index) => (
                <tr key={index}>
                  <td style={td}>{item.created_at}</td>
                  <td style={td}>{item.image_name}</td>
                  <td style={{
                    ...td,
                    color: item.disease_detected ? "#e74c3c" : "#27ae60",
                    fontWeight: "600"
                  }}>
                    {item.disease_detected ? "Detected" : "Not Detected"}
                  </td>
                  <td style={td}>{item.risk_level}</td>
                  <td style={td}>{item.risk_percent}%</td>
                  <td style={td}>{item.confidence}%</td>
                  <td style={td}>{item.heart_rate || "N/A"} BPM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

const th = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  fontSize: "14px"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #f1f1f1",
  fontSize: "13px"
};