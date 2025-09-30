import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ForgotPasswordPopup from '../../pages/auth/ForgotPassword';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem("pin");
        sessionStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="sidebar">
            <div>
                <h2>Menu</h2>
                <nav>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/statement" className={({ isActive }) => isActive ? "active" : ""}>
                        View Statement
                    </NavLink>
                    {/*<NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>*/}
                    {/*    Update Profile*/}
                    {/*</NavLink>*/}
                    <button
                        className={`sidebar-link ${showForgotPassword ? 'active' : ''}`}
                        onClick={() => setShowForgotPassword(true)}
                    >
                        Reset Password
                    </button>
                </nav>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
                Logout
            </button>
            {showForgotPassword && (
                <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />
            )}
        </div>
    );
};

export default Sidebar;