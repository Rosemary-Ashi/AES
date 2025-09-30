import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './exportStatement.css';

const ExportMenu = ({ data, filename = 'export' }) => {
    const exportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const headers = Object.keys(data[0] || {});
        const rows = data.map(row => headers.map(key => row[key]));

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 10,
            styles: { fontSize: 8 }
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="export-menu">
            <button onClick={exportCSV}>CSV</button>
            <button onClick={exportExcel}>Excel</button>
            <button onClick={exportPDF}>PDF</button>
        </div>
    );
};

export default ExportMenu;