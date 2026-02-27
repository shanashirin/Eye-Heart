import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        formData
      );

      // ✅ FIXED HERE
      if (res.data.success) {
        localStorage.setItem("token", res.data.token); // store JWT token
        navigate("/profile"); // go to profile page
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to continue your journey</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />

          <button type="submit">Sign In</button>
        </form>

        <div className="switch-auth">
          <span>Don’t have an account?</span>
          <button onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}