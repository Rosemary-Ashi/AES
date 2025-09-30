import React from "react";
import "./statement.css";

//sessionStorage.getItem('token')
const BalanceTile = ({ balance, formatCurrency }) => {
    if (!balance) return null;

    return (
        <div className="summary-tiles">
            <div className="stattile">
                <h2>Current Balance</h2>
                <p>₦{formatCurrency(balance.value)}</p>
                <small>
                    {balance.date
                        ? new Date(balance.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : ""}
                </small>
            </div>
        </div>
    );
};

export default BalanceTile;