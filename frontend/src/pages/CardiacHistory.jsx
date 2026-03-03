import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CardiacHistory.css";

export default function CardiacHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          "http://localhost:5000/api/vitals",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setRecords(res.data);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getAdvice = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return {
          action:
            "Immediate cardiology consultation recommended. Avoid intense physical strain.",
          diet:
            "Strict low-sodium diet. Avoid fried foods and red meat. Increase leafy vegetables, oats, almonds, omega-3 fish."
        };
      case "Medium":
        return {
          action:
            "Lifestyle changes advised. 30 minutes walking daily and stress management.",
          diet:
            "Reduce salt and sugar. Add fruits, whole grains, olive oil, and adequate hydration."
        };
      default:
        return {
          action:
            "Maintain healthy routine and periodic monitoring.",
          diet:
            "Balanced diet including vegetables, lean protein, and regular exercise."
        };
    }
  };

  if (loading) {
    return <div className="history-loading">Loading cardiac records...</div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Cardiac Risk History</h2>
        <p>AI-based clinical assessment records</p>
      </div>

      {records.length === 0 ? (
        <div className="no-records">
          No cardiac records available.
        </div>
      ) : (
        records.map((item, index) => {
          const isPositive = item.disease_detected === 1;
          const advice = getAdvice(item.risk_level);

          return (
            <div className="history-card" key={index}>
              
              {/* Header Section */}
              <div className="card-top">
                <div className="card-date">
                  {new Date(item.created_at).toLocaleString()}
                </div>

                <div className="card-badges">
                  <div
                    className={`result-badge ${
                      isPositive ? "positive" : "negative"
                    }`}
                  >
                    {isPositive ? "Positive" : "Negative"}
                  </div>

                  <div
                    className={`risk-badge ${item.risk_level.toLowerCase()}`}
                  >
                    {item.risk_level} Risk
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="vitals-section">
                <div>
                  <span>Heart Rate</span>
                  <strong>
                    {item.heart_rate ? item.heart_rate : "--"} BPM
                  </strong>
                </div>

                <div>
                  <span>Risk Percentage</span>
                  <strong>{item.risk_percent}%</strong>
                </div>

                <div>
                  <span>Model Confidence</span>
                  <strong>{item.confidence}%</strong>
                </div>
              </div>

              {/* Clinical Interpretation */}
              <div className="info-section">
                <h4>Clinical Interpretation</h4>
                <p>
                  {isPositive
                    ? "AI model detected patterns associated with possible cardiac abnormality."
                    : "No abnormal cardiac indicators detected from the analyzed retinal image."}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="info-section">
                <h4>Recommended Action</h4>
                <p>{advice.action}</p>
              </div>

              {/* Diet */}
              <div className="info-section">
                <h4>Dietary Guidance</h4>
                <p>{advice.diet}</p>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}