import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./GetAccess.css";

const GetAccess = () => {
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Validation: exactly 1 must be provided
    const inputs = [pin, email, phone].filter((v) => v.trim() !== "");
    if (inputs.length === 0) {
      setMessage("Please enter PIN, Email, or Phone Number.");
      return;
    }
    if (inputs.length > 1) {
      setMessage("Please enter only ONE option.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.post("/api/auth/get-access", {
        pin,
        email,
        mobile_Phone: phone,
      });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit ONE input at a time:
  const disableOtherInputs = (filled) =>
    filled === "" ? false : true;

    return (
    <div className="get-access-container">
      <h2>Get Access</h2>
      <p className="note">
        Enter <strong>only ONE</strong> option below:
      </p>
      <form onSubmit={handleSubmit} className="get-access-form">
        <label>
          PIN:
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter your PIN"
            disabled={disableOtherInputs(email || phone)}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            disabled={disableOtherInputs(pin || phone)}
          />
        </label>

        <label>
          Phone Number:
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your Phone Number"
            disabled={disableOtherInputs(pin || email)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Request Access"}
                </button>
        <button
          type="button"
          className="login-btn"
          onClick={() => navigate("./login")}
          >Login
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default GetAccess;