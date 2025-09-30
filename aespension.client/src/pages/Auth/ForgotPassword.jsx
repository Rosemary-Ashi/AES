import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./ForgotPassword.css";

const ForgotPasswordPopup = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevents multiple clicks
        setLoading(true);
        setMessage("");
        try {
            await axiosClient.post("/api/auth/forgot-password", { email, pin });
            setMessage(
                "If detail provided is registered, a reset link has been sent to your mail."
            );
        } catch (err) {
            setMessage(err.response?.data?.message || "Provide registered email or pin");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form state
        setEmail("");
        setPin("");
        setMessage("");
        setLoading(false);
        // Close popup
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Reset Password</h2>
                <p>Kindly input your registered email or PIN</p>
                {message && <p className="reset-message">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter your PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                    <button type="submit">Reset</button>
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPopup;