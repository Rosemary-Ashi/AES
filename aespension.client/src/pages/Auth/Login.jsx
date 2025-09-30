import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axiosClient from "../../api/axiosClient";
import ForgotPasswordPopup from "./ForgotPassword";
import "./Login.css";
import "./ForgotPassword";

const Login = () => {
  const [PIN, setPIN] = useState("");
  const [Password, setPassword] = useState("");
  const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const Navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!PIN || !Password) {
      setMessage("Please enter your PIN or Email and Password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.post("/api/auth/login", {
        PIN,
        Password,
      });

        // save token to sessionStorage
        if (response.data?.token) {
            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem("tokenExpiry", new Date(response.data.expiry).getTime());
            sessionStorage.setItem("pin", response.data.pin);
        }

      setMessage("Login successful!");
        Navigate("/dashboard");

    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label>
          PIN or Email:
          <input
            type="text"
            value={PIN}
            onChange={(e) => setPIN(e.target.value)}
            placeholder="Enter your PIN or Email"
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
          </form>

          <p>
              Forgot password?{" "}
              <span className="forgot-link" onClick={() => setShowPopup(true)}><button>
                  Reset here
              </button>
              </span>
          </p>

          {message && <p className="message">{message}</p>}
          {showPopup && <ForgotPasswordPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default Login;
