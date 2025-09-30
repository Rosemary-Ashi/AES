import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import BalanceTile from "./BalanceTile";
import StatementTable from "./StatementTable";
import ExportStatement from "./ExportStatement";
import "./statement.css";

const Statement = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statements, setStatements] = useState([]);
    const [balance, setBalance] = useState(null);
    const [, setGainLoss] = useState(null);
    const [, setBF] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const pin = sessionStorage.getItem("pin");
    sessionStorage.getItem("token");

    const fetchStatements = async (e) => {
        e.preventDefault();
        if (!pin) { setError("Reload Page"); return; }

        setLoading(true);
        setError(null);

        try {
            const res = await axiosClient.get(`/api/Statement/${pin}`, {
                params: { startDate: startDate || undefined, endDate: endDate || undefined },
            });

            const raw = res.data;
            const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

            if (data.length === 0) { setStatements([]); setBalance(null); return; }

            const balanceRow = data.find(r => r.descr?.toLowerCase().includes("current balance"));
            const gainLossRow = data.find(r => r.descr?.toLowerCase().includes("gain/loss"));
            const BF = data.find(r => r.descr?.toLowerCase().includes("balance b/f"));

            const filtered = data.filter(r =>
                !r.descr?.toLowerCase().includes("balance b/f") &&
                !r.descr?.toLowerCase().includes("gain/loss")
            );

            setBalance(balanceRow ? { value: balanceRow.total, date: balanceRow.contdate } : null);
            setGainLoss(gainLossRow ? { value: gainLossRow.total, date: gainLossRow.contribution_Date } : null);
            setBF(BF ? { value: BF.total, date: BF.contribution_Date } : null);
            setStatements(filtered);
            setCurrentPage(1); // reset pagination
        } catch (err) {
            console.error(err);
            setError("Failed to fetch statements");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) =>
        value !== undefined && value !== null
            ? value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "0.00";

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-3">
            <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-2xl px-6 py-3">
                <h1>Statement History</h1>

                <BalanceTile balance={balance} formatCurrency={formatCurrency} />

                <form onSubmit={fetchStatements} className="StatementForm">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="TransDate" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="TransDate" />
                    <button type="submit">Search</button>
                </form>

                {error && <p className="text-red-600 mb-4">{error}</p>}
                {loading && <p className="text-gray-600">Loading statements...</p>}

                {/* Rows per page */}
                <div className="pagination-controls">
                    <label>
                        Rows per page:{" "}
                        <select
                            value={itemsPerPage}
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                </div>

                {/* Table */}
                {!loading && statements.length > 0 ? (
                    <>
                    <StatementTable
                        statements={statements}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        formatCurrency={formatCurrency}
                    />
                        <ExportStatement data={statements} filename="statement" />
                    </>
                ) : !loading && !error ? (
                    <p className="text-gray-600">Select Date period</p>
                ) : null}
            </div>
        </div>
    );
};

export default Statement;