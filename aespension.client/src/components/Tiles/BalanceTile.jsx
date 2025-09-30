import React from 'react';
import './BalanceTile.css';

const BalanceTile = ({ title, amount, units }) => {
    return (
        <div className="balance-tile">
            <h3>{title}</h3>
            <p>Balance: ₦{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            {/*<p>Units: {units?.toLocaleString(undefined, { minimumFractionDigits: 4 })}</p>*/}
        </div>
    );
};

export default BalanceTile;