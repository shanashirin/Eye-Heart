import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [clinicalData, setClinicalData] = useState({
    gender: "1", age: "", currentSmoker: "0", cigsPerDay: "",
    BPMeds: "0", prevalentStroke: "0", prevalentHyp: "0",
    diabetes: "0", totChol: "", sysBP: "", diaBP: "",
    BMI: "", heartRate: "", glucose: ""
  });

  // Mapped labels for a professional look
  const featureLabels = {
    gender: "Gender", age: "Age (Years)", currentSmoker: "Current Smoker",
    cigsPerDay: "Cigarettes Per Day", BPMeds: "BP Medication",
    prevalentStroke: "Stroke History", prevalentHyp: "Hypertension History",
    diabetes: "Diabetes", totChol: "Total Cholesterol",
    sysBP: "Systolic BP (mmHg)", diaBP: "Diastolic BP (mmHg)",
    BMI: "BMI Index", heartRate: "Heart Rate (BPM)", glucose: "Glucose Level"
  };

  const featureNames = Object.keys(clinicalData);

  const handleChange = (e) => {
    setClinicalData({
      ...clinicalData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload retinal image");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/signin");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    for (let key in clinicalData) {
      const value = clinicalData[key] === "" ? "0" : clinicalData[key];
      formData.append(key, value);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (error) {
      alert("Error connecting to backend");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING OBJECTS ---
  const styles = {
    wrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#f8fafc"
    },
    card: {
      backgroundColor: "#ffffff",
      maxWidth: "1000px",
      margin: "0 auto 30px auto",
      padding: "40px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      color: "#1e293b"
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      marginTop: "6px"
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    btnAnalyze: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "16px 40px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.4)"
    },
    resultGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "20px",
      background: "#f8fafc",
      padding: "20px",
      borderRadius: "12px",
      marginTop: "20px"
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 30px auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800" }}>🫀 Diagnostic Portal</h1>
          <p style={{ opacity: 0.8, marginTop: "5px" }}>Cardiovascular Risk AI Assessment</p>
        </div>
        <button 
          onClick={() => navigate("/profile")}
          style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
        >
          ← Back to Profile
        </button>
      </div>

      {/* INPUT CARD */}
      <div style={styles.card}>
        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "20px" }}>1. Retinal Imaging</h3>
          <div style={{ padding: "20px", border: "2px dashed #cbd5e1", borderRadius: "12px", textAlign: "center" }}>
            <input 
              type="file" 
              onChange={(e) => setImage(e.target.files[0])} 
              style={{ fontSize: "14px" }}
            />
          </div>
        </section>

        <section>
          <h3 style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "20px" }}>2. Clinical Biomarkers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {featureNames.map((feature) => (
              <div key={feature}>
                <label style={styles.label}>{featureLabels[feature]}</label>

                {feature === "gender" ? (
                  <select name="gender" value={clinicalData.gender} onChange={handleChange} style={styles.input}>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                ) : ["currentSmoker", "BPMeds", "prevalentStroke", "prevalentHyp", "diabetes"].includes(feature) ? (
                  <select name={feature} value={clinicalData[feature]} onChange={handleChange} style={styles.input}>
                    <option value="0">No / Negative</option>
                    <option value="1">Yes / Positive</option>
                  </select>
                ) : (
                  <input type="number" name={feature} value={clinicalData[feature]} onChange={handleChange} style={styles.input} placeholder="0.00" />
                )}
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btnAnalyze, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Processing Clinical Data..." : "Run AI Diagnostics"}
          </button>
        </div>
      </div>

      {/* RESULT CARD */}
      {result && (
        <div style={styles.card}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "24px", color: "#0f172a" }}>Diagnostic Summary</h2>
            <div style={{ 
              display: "inline-block", 
              padding: "10px 25px", 
              borderRadius: "50px", 
              marginTop: "10px",
              fontWeight: "700",
              backgroundColor: result.disease_detected ? "#fef2f2" : "#f0fdf4",
              color: result.disease_detected ? "#dc2626" : "#16a34a",
              border: `1px solid ${result.disease_detected ? "#fee2e2" : "#dcfce7"}`
            }}>
              {result.disease_detected ? "⚠ Cardiovascular Disease Detected" : "✅ No Disease Detected"}
            </div>
          </div>

          <div style={styles.resultGrid}>
            <div><span style={styles.label}>Risk Category</span><div style={{ fontWeight: "700", fontSize: "18px" }}>{result.risk_level}</div></div>
            <div><span style={styles.label}>Risk Probability</span><div style={{ fontWeight: "700", fontSize: "18px" }}>{result.risk_percent}%</div></div>
            <div><span style={styles.label}>AI Confidence</span><div style={{ fontWeight: "700", fontSize: "18px" }}>{result.confidence}%</div></div>
            <div><span style={styles.label}>Heart Rate</span><div style={{ fontWeight: "700", fontSize: "18px" }}>{result.heart_rate ? `${result.heart_rate} BPM` : "N/A"}</div></div>
          </div>

          {!result.disease_detected && (
            <div style={{ marginTop: "25px", padding: "15px", backgroundColor: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "4px" }}>
              <strong style={{ color: "#1e40af" }}>10-Year CHD Forecast:</strong>
              <p style={{ margin: "5px 0 0 0", color: "#1e3a8a" }}>{result.ten_year_chd_prediction}</p>
            </div>
          )}

          {/* IMAGES SECTION */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "40px" }}>
            {result.original_image && (
              <div style={{ flex: 1, minWidth: "300px" }}>
                <h4 style={styles.label}>Submitted Retinal Scan</h4>
                <img src={`data:image/png;base64,${result.original_image}`} alt="Original" style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </div>
            )}
            {result.gradcam_image && (
              <div style={{ flex: 1, minWidth: "300px" }}>
                <h4 style={styles.label}>Grad-CAM Saliency Map</h4>
                <img src={`data:image/png;base64,${result.gradcam_image}`} alt="GradCAM" style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}