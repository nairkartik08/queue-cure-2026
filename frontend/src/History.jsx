import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./App.css";

function History() {
    const [patients, setPatients] = useState([]);
    const [clinicStatus, setClinicStatus] = useState("OPEN");

    const darkMode = localStorage.getItem("darkMode") === "true";

    const groupedPatients = patients.reduce((groups, patient) => {
        const date = patient.visitDate;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(patient);
        return groups;
    }, {});

    useEffect(() => {
        fetchHistory();
        
        const fetchStatus = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/patients/session-status");
                if (res.data) {
                    setClinicStatus(res.data.status);
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetchStatus();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/patients/history"
            );
            setPatients(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={darkMode ? "dashboard-layout dark-mode" : "dashboard-layout"}>
            <Sidebar />
            <div className="main-content" style={{ padding: "30px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
                <Topbar clinicStatus={clinicStatus} />

                <h1 style={{ marginTop: "20px", fontSize: "28px", color: darkMode ? "#f8fafc" : "#0f172a", fontWeight: "700" }}>
                    Clinic History
                </h1>

                {Object.entries(groupedPatients).map(([date, patientList]) => (
                    <div
                        key={date}
                        className="table-card"
                        style={{
                            marginBottom: "40px",
                            background: darkMode ? "#1e293b" : "white",
                            padding: "24px",
                            borderRadius: "16px",
                            border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0"
                        }}
                    >
                        <h2 style={{ color: darkMode ? "#f1f5f9" : "#1e293b", fontSize: "20px", margin: "0 0 10px 0" }}>
                            {date} <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>({patientList[0]?.dayName})</span>
                        </h2>

                        <p style={{ color: darkMode ? "#94a3b8" : "#64748b", margin: "0 0 20px 0", fontSize: "14px" }}>
                            Total Patients: <strong>{patientList.length}</strong>
                        </p>

                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: darkMode ? "2px solid #334155" : "2px solid #f1f5f9", color: darkMode ? "#94a3b8" : "#64748b" }}>
                                    <th style={{ padding: "12px 8px" }}>Token</th>
                                    <th style={{ padding: "12px 8px" }}>Name</th>
                                    <th style={{ padding: "12px 8px" }}>Priority</th>
                                    <th style={{ padding: "12px 8px" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientList.map((patient) => (
                                    <tr
                                        key={patient._id}
                                        style={{ borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9", color: darkMode ? "#f1f5f9" : "#1e293b" }}
                                    >
                                        <td style={{ padding: "12px 8px", fontWeight: "600" }}>
                                            {patient.tokenNumber}
                                        </td>
                                        <td style={{ padding: "12px 8px" }}>
                                            {patient.name}
                                        </td>
                                        <td style={{ padding: "12px 8px" }}>
                                            <span
                                                style={{
                                                    color:
                                                        patient.priority === "Emergency"
                                                            ? "#ef4444"
                                                            : patient.priority === "Urgent"
                                                                ? "#f97316"
                                                                : "#22c55e",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {patient.priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 8px" }}>
                                            <span
                                                style={{
                                                    background:
                                                        patient.status === "Completed"
                                                            ? "#dcfce7"
                                                            : patient.status === "Called"
                                                                ? "#dbeafe"
                                                                : patient.status === "Skipped"
                                                                    ? "#fee2e2"
                                                                    : "#f1f5f9",
                                                    color:
                                                        patient.status === "Completed"
                                                            ? "#166534"
                                                            : patient.status === "Called"
                                                                ? "#1e40af"
                                                                : patient.status === "Skipped"
                                                                    ? "#991b1b"
                                                                    : "#475569",
                                                    padding: "4px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                {patient.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default History;