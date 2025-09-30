import React from "react";
import Pagination from "./Pagination";
import "./statement.css";

const StatementTable = ({
    statements,
    currentPage,
    itemsPerPage,
    onPageChange,
    formatCurrency,
}) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStatements = statements.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(statements.length / itemsPerPage);

    return (
        <div className="StatementTable">
            <table>
                <thead>
                    <tr>
                        <th>S/N</th>
                        <th>PIN</th>
                        <th>Description</th>
                        <th>Transaction Date</th>
                        <th>Mandatory</th>
                        <th>Voluntary</th>
                        <th>Pre-Act NSITF</th>
                        <th>Total</th>
                        <th>Remark</th>
                        <th>Contribution Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentStatements.map((st, idx) => (
                        <tr key={idx} className="Content">
                            <td>{indexOfFirstItem + idx + 1}</td>
                            <td>{st.pin}</td>
                            <td>{st.descr}</td>
                            <td>
                                {st.tranS_DATE
                                    ? new Date(st.tranS_DATE).toLocaleDateString("en-GB")
                                    : "N/A"}
                            </td>
                            <td>₦{formatCurrency(st.mandatory)}</td>
                            <td>₦{formatCurrency(st.voluntary)}</td>
                            <td>₦{formatCurrency(st.preactnsitf)}</td>
                            <td className="text-green-600 font-semibold">
                                ₦{formatCurrency(st.total)}
                            </td>
                            <td>{st.remark || "N/A"}</td>
                            <td>{new Date(st.contdate).toLocaleDateString("en-GB")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
};

export default StatementTable;