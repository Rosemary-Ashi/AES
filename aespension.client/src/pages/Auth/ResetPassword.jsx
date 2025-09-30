import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../api/axiosClient";
import "./ResetPassword.css";

const ResetPasswordPage = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setToken(queryParams.get('token'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post("api/auth/reset-password", {
                token,
                newPassword,
            });
            setMessage('Password reset successful. You can now log in.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <div>
            <h1>Reset Password</h1>

            <div className="reset-container">

                <div className="reset-card">

                    {message && <p className="reset-message">{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="reset-btn">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div></div>
    );
};

export default ResetPasswordPage;