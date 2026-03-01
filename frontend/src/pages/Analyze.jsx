import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data?.name) {
        setPatientName(res.data.name);
      }
    })
    .catch(() => {});
  }, []);

  const caseId = React.useMemo(() => {
    return `REF-${Date.now().toString().slice(-6)}`;
  }, []);

  const [clinicalData, setClinicalData] = useState({
    gender: "1", age: "", currentSmoker: "0", cigsPerDay: "",
    BPMeds: "0", prevalentStroke: "0", prevalentHyp: "0",
    diabetes: "0", totChol: "", sysBP: "", diaBP: "",
    BMI: "", heartRate: "", glucose: ""
  });

  const featureLabels = {
    gender: "Gender", age: "Age (Years)", currentSmoker: "Current Smoker",
    cigsPerDay: "Cigarettes Per Day", BPMeds: "BP Medication",
    prevalentStroke: "Stroke History", prevalentHyp: "Hypertension History",
    diabetes: "Diabetes", totChol: "Total Chol (mg/dL)",
    sysBP: "Systolic BP", diaBP: "Diastolic BP",
    BMI: "BMI Index", heartRate: "Heart Rate", glucose: "Glucose"
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
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f6c1d8 0%, #c9c3e6 50%, #b7d7f2 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      justifyContent: "center"
    },
    mainPanel: {
      flex: 1,
      maxWidth: "1100px",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(30px)",
      borderRadius: "30px",
      padding: "50px",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
    },
    activityPanel: {
      background: "white",
      padding: "30px",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
      marginBottom: "25px",
      border: "1px solid #f0f0f0"
    },
    input: {
      width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1.5px solid #edf2f7",
      fontSize: "14px", marginTop: "8px", backgroundColor: "#fff", color: "#2d3436", 
      transition: "all 0.2s ease", boxSizing: "border-box"
    },
    label: {
      fontSize: "0.75rem", fontWeight: "700", color: "#718096", textTransform: "uppercase",
      letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px"
    },
    btnAnalyze: {
      background: "linear-gradient(135deg, #ff7eb3, #6ec6ff)",
      color: "white", border: "none", padding: "18px 50px", borderRadius: "15px",
      fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.2s",
      boxShadow: "0 10px 20px rgba(255, 126, 179, 0.2)"
    },
    navBtn: {
      background: "rgba(255,255,255,0.8)", color: "#4a5568", border: "1px solid #e2e8f0", 
      padding: "10px 18px", borderRadius: "10px", fontWeight: "600", cursor: "pointer"
    }
  };

  return (
    <div style={styles.wrapper}>
      <main style={styles.mainPanel} id="printable-report">
        
        {/* HEADER */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }} className="no-print">
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "850", color: "#1a202c", letterSpacing: "-1px" }}>Diagnostic Portal</h1>
            <p style={{ color: "#718096", marginTop: "4px", fontSize: "15px" }}>AI-Powered Cardiovascular Risk Assessment</p>
          </div>
          <button onClick={() => navigate("/profile")} style={styles.navBtn}>
            ← Back to Profile
          </button>
        </header>

        {/* SECTION 1: IDENTIFICATION */}
        <section style={styles.activityPanel} className="no-print">
          <h3 style={{ marginBottom: "20px", fontSize: "18px", color: "#2d3748" }}>Patient Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
             <div>
                <label style={styles.label}>Patient Full Name</label>
                <input 
                    type="text" 
                    placeholder="Enter legal name..." 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)} 
                    style={styles.input} 
                />
             </div>
             <div>
                <label style={styles.label}>Case Reference</label>
                <input type="text" value={caseId} disabled style={{...styles.input, backgroundColor: "#f7fafc", color: "#a0aec0"}} />
             </div>
          </div>
        </section>

        {/* SECTION 2: UPLOAD */}
        <section style={styles.activityPanel} className="no-print">
          <h3 style={{ marginBottom: "20px", fontSize: "18px", color: "#2d3748" }}>1. Retinal Fundus Image</h3>
          <div style={{ 
            padding: "40px", 
            border: "2px dashed #cbd5e0", 
            borderRadius: "15px", 
            textAlign: "center", 
            backgroundColor: image ? "#f0fff4" : "#f8fafc",
            cursor: "pointer",
            transition: "all 0.3s"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>{image ? "✅" : "📸"}</div>
            <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ fontSize: "14px" }} />
            {image && <p style={{ marginTop: "15px", fontWeight: "700", color: "#38a169" }}>File: {image.name}</p>}
            {!image && <p style={{ color: "#718096", fontSize: "13px", marginTop: "10px" }}>PNG, JPG or JPEG allowed (High resolution preferred)</p>}
          </div>
        </section>

        {/* SECTION 3: BIOMARKERS */}
        <section style={styles.activityPanel} className="no-print">
          <h3 style={{ marginBottom: "25px", fontSize: "18px", color: "#2d3748" }}>2. Clinical Biomarkers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
            {featureNames.map((feature) => (
              <div key={feature} style={{ background: "#fdfdfd", padding: "12px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
                <label style={styles.label}>
                  {featureLabels[feature]}
                </label>
                {feature === "gender" ? (
                  <select name="gender" value={clinicalData.gender} onChange={handleChange} style={styles.input}>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                ) : ["currentSmoker", "BPMeds", "prevalentStroke", "prevalentHyp", "diabetes"].includes(feature) ? (
                  <select name={feature} value={clinicalData[feature]} onChange={handleChange} style={styles.input}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                ) : (
                  <input type="number" name={feature} value={clinicalData[feature]} onChange={handleChange} style={styles.input} placeholder="--" />
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btnAnalyze, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Processing Real-time Data..." : "Generate AI Analysis"}
            </button>
          </div>
        </section>

        {/* RESULT SECTION */}
        {result && (
          <section style={{ ...styles.activityPanel, border: "2px solid #c9c3e6", padding: "40px" }}>
            
            {/* PRINT-ONLY HEADER */}
            <div className="print-only" style={{ marginBottom: "40px", borderBottom: "3px solid #2d3436", paddingBottom: "20px", display: "none" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#1a202c", margin: 0 }}>Eye2Heart Clinical Report</h1>
              <p style={{ color: "#718096" }}>Automated Cardiovascular Risk Screening System</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>
                <div style={styles.label}>Patient: <span style={{ color: "#1a202c", textTransform: "none" }}>{patientName || "Anonymous"}</span></div>
                <div style={styles.label}>Date: <span style={{ color: "#1a202c", textTransform: "none" }}>{new Date().toLocaleDateString()}</span></div>
                <div style={styles.label}>Reference ID: <span style={{ color: "#1a202c", textTransform: "none" }}>{caseId}</span></div>
                <div style={styles.label}>Status: <span style={{ color: result.disease_detected ? "#e53e3e" : "#38a169", textTransform: "none" }}>{result.disease_detected ? "High Risk Detected" : "Low Risk Detected"}</span></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
              <h2 style={{ fontSize: "24px", color: "#1a202c", fontWeight: "800", margin: 0 }}>Diagnostic Summary</h2>
              <button 
                onClick={handleDownload} 
                style={{ ...styles.navBtn, backgroundColor: "#2d3436", color: "white" }}
                className="no-print"
              >
                📥 Export Official Report (PDF)
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start", marginBottom: "40px" }}>
              {/* GAUGE */}
              <div style={{ textAlign: "center", minWidth: "240px" }}>
                <div style={{ 
                  position: "relative", width: "220px", height: "110px", 
                  background: "linear-gradient(to right, #00b894 0%, #fdcb6e 50%, #ff7eb3 100%)", 
                  borderRadius: "110px 110px 0 0", margin: "0 auto", overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "160px", height: "80px", background: "white", borderRadius: "110px 110px 0 0", zIndex: 1 }}></div>
                  <div style={{ 
                    position: "absolute", bottom: "0px", left: "50%", width: "4px", height: "95px", background: "#2d3436", borderRadius: "4px",
                    transformOrigin: "bottom center",
                    transform: `translateX(-50%) rotate(${ (result.risk_percent * 1.8) - 90 }deg)`,
                    transition: "transform 2s cubic-bezier(0.17, 0.67, 0.83, 0.67)", zIndex: 2
                  }}></div>
                </div>
                <div style={{ marginTop: "15px" }}>
                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#1a202c" }}>{result.risk_percent}%</div>
                    <div style={styles.label}>Calculated Risk Probability</div>
                </div>
              </div>

              {/* STAT TILES */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {[
                    { label: "Clinical Result", val: result.disease_detected ? "POSITIVE" : "NEGATIVE", color: result.disease_detected ? "#e53e3e" : "#38a169" },
                    { label: "Risk Category", val: result.risk_level.toUpperCase(), color: "#2d3436" },
                    { label: "Model Confidence", val: `${result.confidence}%`, color: "#2d3436" },
                    { label: "Heart Rate", val: `${result.heart_rate || "N/A"} BPM`, color: "#2d3436" }
                ].map((stat, i) => (
                    <div key={i} style={{ padding: "18px", background: "#f8fafc", borderRadius: "15px", border: "1px solid #edf2f7" }}>
                        <span style={styles.label}>{stat.label}</span>
                        <div style={{ fontWeight: "850", color: stat.color, fontSize: "16px", marginTop: "5px" }}>{stat.val}</div>
                    </div>
                ))}
              </div>
            </div>

            {/* IMAGES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
              {result.original_image && (
                <div>
                  <h4 style={{...styles.label, marginBottom: "10px"}}>Input Retinal Scan</h4>
                  <img src={`data:image/png;base64,${result.original_image}`} alt="Original" style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                </div>
              )}
              {result.gradcam_image && (
                <div>
                  <h4 style={{...styles.label, marginBottom: "10px"}}>AI Attention (Grad-CAM)</h4>
                  <img src={`data:image/png;base64,${result.gradcam_image}`} alt="GradCAM" style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                </div>
              )}
            </div>

            {/* FORECAST */}
            {!result.disease_detected && (
              <div style={{ marginTop: "30px", padding: "20px", background: "#f0fff4", borderRadius: "15px", borderLeft: "5px solid #38a169" }}>
                <div style={{ fontWeight: "800", fontSize: "13px", color: "#2f855a", marginBottom: "8px", textTransform: "uppercase" }}>10-Year Prognostic Forecast</div>
                <p style={{ margin: 0, fontSize: "15px", color: "#2d3748", lineHeight: "1.5" }}>{result.ten_year_chd_prediction}</p>
              </div>
            )}

            {/* RECOMMENDATIONS */}
            <div style={{ marginTop: "25px", padding: "25px", borderRadius: "15px", background: "#f1f5f9", borderLeft: "5px solid #64748b" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", marginBottom: "12px", color: "#475569", textTransform: "uppercase" }}>Clinical Guidance</div>
              <p style={{ fontSize: "14px", margin: 0, color: "#1e293b", lineHeight: "1.7" }}>
                {/* Logic remains exactly the same as requested */}
                {result.disease_detected ? (
                  result.risk_level === "High" ? (
                    <><b>Immediate Action:</b> Consultation with a cardiologist is strongly recommended. Further diagnostic evaluation including ECG, echocardiography, and blood work should be performed.</>
                  ) : result.risk_level === "Medium" ? (
                    <><b>Recommendation:</b> A detailed cardiovascular assessment is recommended. Regular monitoring of vitals and dietary modification should be initiated.</>
                  ) : (
                    <><b>Observation:</b> Although disease markers are detected, medical supervision and preventive cardiac evaluation are recommended to prevent progression.</>
                  )
                ) : (
                  result.risk_level === "High" ? (
                    <><b>Preventive Note:</b> No active disease detected, however risk factors indicate high probability of future complications. Routine screening every 6 months is advised.</>
                  ) : result.risk_level === "Medium" ? (
                    <><b>Preventive Note:</b> Moderate cardiovascular risk observed. Preventive care including regular exercise and dietary control are recommended.</>
                  ) : (
                    <><b>Status:</b> No cardiovascular disease detected and low risk observed. Continue annual preventive checkups.</>
                  )
                )}
              </p>
            </div>

            <div className="print-only" style={{ marginTop: "50px", borderTop: "1px solid #e2e8f0", paddingTop: "20px", fontSize: "11px", color: "#94a3b8", display: "none" }}>
              <p>This report was generated by the <b>Eye2Heart AI Diagnostic Engine</b>. It is a screening aid and should be validated by a medical professional.</p>
              <p>Reference: {caseId} | Timestamp: {new Date().toLocaleString()}</p>
            </div>
          </section>
        )}
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            #printable-report { 
              box-shadow: none !important; 
              border: none !important; 
              background: white !important; 
              backdrop-filter: none !important; 
              width: 100% !important; 
              max-width: 100% !important; 
              padding: 0 !important; 
            }
          }
          input:focus, select:focus {
            border-color: #6ec6ff !important;
            box-shadow: 0 0 0 3px rgba(110, 198, 255, 0.1);
            outline: none;
          }
        `}</style>
      </main>
    </div>
  );
}