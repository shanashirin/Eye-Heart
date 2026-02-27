import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Analyze() {

  const navigate = useNavigate();

  const [image, setImage] = useState(null);

  const [clinicalData, setClinicalData] = useState({
    gender: "1",
    currentSmoker: "0",
    BPMeds: "0",
    prevalentStroke: "0",
    prevalentHyp: "0",
    diabetes: "0"
  });

  const [result, setResult] = useState(null);

  const featureNames = [
    "gender", "age", "currentSmoker", "cigsPerDay",
    "BPMeds", "prevalentStroke",
    "prevalentHyp", "diabetes",
    "totChol", "sysBP", "diaBP",
    "BMI", "heartRate", "glucose"
  ];

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

  console.log("TOKEN:", token); // debug check

  const formData = new FormData();
  formData.append("image", image);

  for (let key in clinicalData) {
    formData.append(key, clinicalData[key]);
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/predict",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Backend Response:", res.data);
    setResult(res.data);

  } catch (error) {

    if (error.response && error.response.status === 401) {
      alert("Unauthorized. Please login again.");
      navigate("/signin");
    } else {
      alert("Error connecting to backend");
    }

    console.log(error);
  }
};

  return (
    <div style={{ padding: "40px" }}>

      <button onClick={() => navigate("/profile")}>
        ← Back to Profile
      </button>

      <h1>AI Cardiovascular Risk Analyzer</h1>

      <h3>Upload Retinal Image</h3>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <h3>Clinical Details</h3>

      {featureNames.map((feature) => (
        <div key={feature} style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            {feature}
          </label>

          {feature === "gender" ? (
            <select
              name="gender"
              value={clinicalData.gender}
              onChange={handleChange}
            >
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          )
          : ["currentSmoker", "BPMeds", "prevalentStroke", "prevalentHyp", "diabetes"].includes(feature) ? (
            <select
              name={feature}
              value={clinicalData[feature] || "0"}
              onChange={handleChange}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          )
          : (
            <input
              type="number"
              name={feature}
              value={clinicalData[feature] || ""}
              onChange={handleChange}
            />
          )}

        </div>
      ))}

      <button onClick={handleSubmit}>
        Analyze
      </button>

      {/* ================= RESULTS ================= */}
      {result && (
  <div style={{ marginTop: "30px" }}>
    <h2>Results</h2>

    {typeof result.disease_detected !== "undefined" && (
      result.disease_detected ? (
        <h2 style={{ color: "red" }}>
          ⚠ Cardiovascular Disease Detected
        </h2>
      ) : (
        <h2 style={{ color: "green" }}>
          ✅ No Cardiovascular Disease Detected
        </h2>
      )
    )}

    <p><strong>Risk Level:</strong> {result.risk_level}</p>
    <p><strong>Risk %:</strong> {result.risk_percent}%</p>
    <p><strong>Confidence:</strong> {result.confidence}%</p>
    <p>
  <strong>Heart Rate:</strong>{" "}
  {result.heart_rate ? `${result.heart_rate} BPM` : "Not Provided"}
</p>

    <p>
      <strong>10 Year CHD Prediction:</strong><br />
      {result.ten_year_chd_prediction}
    </p>
    {result.original_image && (
  <div style={{ marginTop: "20px" }}>
    <h3>Original Retinal Image</h3>
    <img
      src={`data:image/png;base64,${result.original_image}`}
      alt="Original"
      width="300"
      style={{ borderRadius: "10px" }}
    />
  </div>
)}

{/* Grad-CAM Image */}
{result.gradcam_image && (
  <div style={{ marginTop: "20px" }}>
    <h3>Grad-CAM Visualization</h3>
    <img
      src={`data:image/png;base64,${result.gradcam_image}`}
      alt="GradCAM"
      width="300"
      style={{ borderRadius: "10px" }}
    />
  </div>
)}
  </div>
)}

    </div>
  );
}