import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./App.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analytics() {
  const [data, setData] = useState(null);
  const [clinicStatus, setClinicStatus] = useState("OPEN");

  const darkMode = localStorage.getItem("darkMode") === "true";

  useEffect(() => {
    fetchAnalytics();
    
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

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/patients/analytics"
      );
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const priorityData = data ? [
    {
      name: "Emergency",
      value: data.emergency
    },
    {
      name: "Urgent",
      value: data.urgent
    },
    {
      name: "Normal",
      value: data.normal
    }
  ] : [];

  const COLORS = [
    "#dc2626",
    "#f59e0b",
    "#16a34a"
  ];

  return (
    <div className={darkMode ? "dashboard-layout dark-mode" : "dashboard-layout"}>
      <Sidebar />
      <div className="main-content" style={{ padding: "30px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
        <Topbar clinicStatus={clinicStatus} />

        <h1 style={{ marginTop: "20px", fontSize: "28px", color: darkMode ? "#f8fafc" : "#0f172a", fontWeight: "700" }}>
          Analytics Dashboard
        </h1>

        {!data ? (
          <div style={{ padding: "50px", textAlign: "center", color: darkMode ? "#94a3b8" : "#64748b" }}>
            <h2>Loading analytics data...</h2>
          </div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginTop: "20px" }}>
              <div className="stat-card" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b", border: darkMode ? "1px solid #334155" : "none" }}>
                <h4 style={{ color: darkMode ? "#94a3b8" : "#64748b", margin: "0 0 10px 0" }}>Total Registered</h4>
                <h2 style={{ fontSize: "28px", margin: 0, fontWeight: "700" }}>{data.totalPatients}</h2>
              </div>

              <div className="stat-card" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b", border: darkMode ? "1px solid #334155" : "none" }}>
                <h4 style={{ color: darkMode ? "#94a3b8" : "#64748b", margin: "0 0 10px 0" }}>Waiting</h4>
                <h2 style={{ fontSize: "28px", margin: 0, fontWeight: "700", color: "#2563eb" }}>{data.waiting}</h2>
              </div>

              <div className="stat-card" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b", border: darkMode ? "1px solid #334155" : "none" }}>
                <h4 style={{ color: darkMode ? "#94a3b8" : "#64748b", margin: "0 0 10px 0" }}>Called</h4>
                <h2 style={{ fontSize: "28px", margin: 0, fontWeight: "700", color: "#f59e0b" }}>{data.called}</h2>
              </div>

              <div className="stat-card" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b", border: darkMode ? "1px solid #334155" : "none" }}>
                <h4 style={{ color: darkMode ? "#94a3b8" : "#64748b", margin: "0 0 10px 0" }}>Completed</h4>
                <h2 style={{ fontSize: "28px", margin: 0, fontWeight: "700", color: "#16a34a" }}>{data.completed}</h2>
              </div>
            </div>

            <div
              className="stat-card"
              style={{
                marginTop: "30px",
                height: "450px",
                background: darkMode ? "#1e293b" : "white",
                color: darkMode ? "#f1f5f9" : "#1e293b",
                border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                padding: "24px",
                borderRadius: "16px"
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 20px 0" }}>
                Priority Distribution
              </h2>

              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;