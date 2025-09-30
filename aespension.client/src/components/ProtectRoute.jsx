import React from 'react';
import { Navigate } from 'react-router-dom';
//import jwtDecode from "jwt-decode";

const ProtectRoute = ({ children }) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
export default ProtectRoute;