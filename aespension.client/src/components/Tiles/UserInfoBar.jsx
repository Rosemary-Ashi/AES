import React from 'react';

const UserInfoBar = ({ name, pin, fundType }) => {
    return (
        <div style={styles.bar}>
            <div>
                <p style={styles.welcome}>Welcome <span style={{ fontSize: "20px", fontWeight: "bold", color:"#444" }}>{name}</span></p>
                <p style={styles.details}>{pin}</p>
                <p style={styles.details}> {fundType}</p>
            </div>            
        </div>
    );
};

const styles = {
    bar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        borderRadius: "12px",
        padding: "10px 20px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",        
        marginBottom: "15px"
    },
    welcome: { margin: 0, fontSize: "30px", color: "#444" },
    details: { margin: 0, fontSize: "20px", color: "#444", fontWeight: "bold" },
    //login: { margin: 0, fontSize: "14px", color: "#34495e" }
};

export default UserInfoBar;