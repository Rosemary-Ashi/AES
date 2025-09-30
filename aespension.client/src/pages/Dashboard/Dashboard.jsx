import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import BalanceTile from '../../components/Tiles/BalanceTile';
import UserInfoBar from '../../components/Tiles/UserInfoBar';
import './Dashboard.css';

const Dashboard = () => {
    const [balances, setBalances] = useState([]);
    const [employee, setEmployee] = useState(null);

    sessionStorage.getItem('Token')
    //sessionStorage.getItem('tokenExpiry')

    useEffect(() => {
        const pin = sessionStorage.getItem('pin');
        if (!pin) {
            console.error('No PIN found. Please log in.');
            return;
        }

        const endDate = new Date().toISOString().split('T')[0];

        axiosClient
            .get(`/api/Balance/${pin}?endDate=${endDate}`)
            .then(res => {
                const response = res.data;

                if (Array.isArray(response)) {
                    setBalances(response);
                } else if (response && Array.isArray(response.balances)) {
                    setBalances(response.balances);
                } else {
                    setBalances([]); // safe fallback
                }
            })
            .catch(err => console.error(err));

        axiosClient
            .get(`/api/auth/Profile/${pin}`)
            .then(res => setEmployee(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="dashboard">
            <h1>My Dashboard</h1>
            {employee && (
                <UserInfoBar
                    name={employee.name}
                    pin={employee.pin}
                />
            )}
            <div className="tiles-container">
                {Array.isArray(balances) && balances.map((b, idx) => (
                    <BalanceTile
                        key={idx}
                        title={b.fund}
                        amount={b.balance}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;