import React from "react";

export default function SignIn() {
  return (
    <div className="page-container">
      <h1>Sign In</h1>

      <form className="signin-form">
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Don't have an account? Register Soon.
      </p>
    </div>
  );
}
