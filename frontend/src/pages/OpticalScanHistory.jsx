import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./OpticalScanHistory.css";

export default function OpticalScanHistory() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");

  useEffect(() => {
 

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/vitals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
     fetchHistory();
  }, []);

  // --- PDF GENERATION LOGIC ---
  const generateDetailedReport = (item) => {
  const doc = new jsPDF();
  const date = new Date(item.created_at).toLocaleDateString();

  doc.setFontSize(20);
  doc.text("Retinal Analysis Summary", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Diagnostic Category', 'AI Analysis Result']],
    body: [
      ['Examination Date', date],
      ['Diagnostic Outcome', item.disease_detected ? "ABNORMALITY DETECTED" : "NO ISSUES FOUND"],
      ['Risk Level', item.risk_level || "N/A"],
      ['Risk Percentage', `${item.risk_percent ?? "N/A"}%`],
      ['AI Confidence', `${item.confidence ?? "N/A"}%`],
    ]
  });

  doc.save(`Scan_Report_${date}.pdf`);
};

  // --- FILTERING LOGIC ---
  const filteredHistory = history.filter((item) => {
    const statusText = item.disease_detected ? "abnormality" : "clear";
    const dateText = new Date(item.created_at).toLocaleDateString().toLowerCase();
    
    const searchMatch = 
      dateText.includes(searchTerm.toLowerCase()) ||
      statusText.includes(searchTerm.toLowerCase());
    
    const severityMatch = filterLevel === "All" || item.risk_level === filterLevel;
    
    return searchMatch && severityMatch;
  });

  return (
    <div className="history-page-wrapper">
      <div className="history-header">
        <div className="title-section">
          <h2>Retinal Scan History</h2>
          <p>Review and manage previous diagnostic scans</p>
        </div>
        
        <div className="filter-toolbar">
          <select 
            className="severity-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          <div className="search-box-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search date or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">No matching records found.</div>
        ) : (
          filteredHistory.map((item, index) => (
            <div className="history-card" key={index}>
              <div className="image-grid">
                <div className="img-box">
                  <label>ORIGINAL SCAN</label>
                  <img src={`data:image/png;base64,${item.original_image}`} alt="Original" />
                </div>
                <div className="img-box">
                  <label>GRAD-CAM ANALYSIS</label>
                  <img src={`data:image/png;base64,${item.gradcam_image}`} alt="Analysis" />
                </div>
              </div>

              <div className="scan-info-panel">
                <div className="info-header">
                  <span className="scan-date">
                    {new Date(item.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                  <span className={`status-pill ${item.disease_detected ? "detected" : "clear"}`}>
                    {item.disease_detected ? "Abnormality Detected" : "No Issues Found"}
                  </span>
                </div>

                <div className="stats-grid">
                  <div className="stat-item">
                    <small>Risk Level</small>
                    <p className={`risk-${item.risk_level?.toLowerCase()}`}>{item.risk_level}</p>
                  </div>
                  <div className="stat-item">
                    <small>Risk Percentage</small>
                    <p>{item.risk_percent}%</p>
                  </div>
                  <div className="stat-item">
                    <small>AI Confidence</small>
                    <p>{item.confidence}%</p>
                  </div>
                </div>
                
                <button className="download-btn" onClick={() => generateDetailedReport(item)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Generate Detailed Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}