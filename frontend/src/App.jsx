import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import "./App.css";
import Profile from "./pages/Profile";
import VitalsTrends from "./pages/VitalsTrends";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";
function App() {
  return (
    <Router>
      <div className="navbar">
        <div className="navbar-content">
          <div className="logo">👁 Eye2Heart</div>
        </div>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/help">Help</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/signin" className="signin-btn">Sign In</NavLink>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vitals" element={<VitalsTrends />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

    </Router>
  );
}

export default App;