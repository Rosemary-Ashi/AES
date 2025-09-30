import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GetAccess from "./pages/Auth/GetAccess";
import Login from "./pages/Auth/Login";
import ResetPassword from "./pages/Auth/ResetPassword";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Statement from "./pages/Statement/Statement";
//import UpdateProfile from "./pages/Profile/UpdateProfile";
import Sidebar from "./components/Layout/Sidebar";
import ProtectRoute from "./components/ProtectRoute";
import "./App.css";
import Logo from './assets/Logo.svg';

const AppRoutes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hideSidebarRoutes = ["/login", "/","/reset-password"];
    const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

    useEffect(() => {
        const expiryTime = sessionStorage.getItem("tokenExpiry");
        if (expiryTime && Date.now() > Number(expiryTime)) {
            sessionStorage.clear();
            navigate("/login");
        }
    }, []);

    return (        
            <div className="app-container">
                {!shouldHideSidebar && <Sidebar />}
                <img src={Logo} alt="AESPension" width={100} className="top-right-logo" />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<GetAccess />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/forgot-Password" element={<ProtectRoute><ForgotPassword /></ProtectRoute>} />
                        <Route path="/dashboard" element={<ProtectRoute><Dashboard /></ProtectRoute>} />
                        <Route path="/statement" element={<ProtectRoute><Statement /></ProtectRoute>} />
                        {/*<Route path="/update-profile" element={<UpdateProfile />} />*/}
                    </Routes>
                </div>
            </div>
    );
};

const App = () => (
    <Router >
        <AppRoutes />
    </Router>
);

export default App;