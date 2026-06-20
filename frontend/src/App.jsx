import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";

import {
  useState,
  useEffect
} from "react";

import {
  useNavigate,
  useLocation
} from "react-router-dom";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    priority: "Normal",
  });

  const [patients, setPatients] = useState([]);

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/patients`
      );

      setPatients(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [currentToken, setCurrentToken] = useState("");

  const [clinicStatus, setClinicStatus] = useState("OPEN");

  const [dynamicAvgTime, setDynamicAvgTime] = useState(null);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchWaitTimeStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/patients-ahead`);
      if (res.data && res.data.dynamicAvgTime !== undefined) {
        setDynamicAvgTime(res.data.dynamicAvgTime);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchClinicStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/session-status`);
      if (res.data) {
        setClinicStatus(res.data.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const refreshDashboard = () => {
    fetchPatients();
    fetchCurrentToken();
    fetchWaitTimeStats();
    fetchClinicStatus();
  };

  const callNextPatient = async () => {

    if (loading) return;

    setLoading(true);

    try {

      const res =
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/patients/call-next`
        );

      setCurrentToken(
        res.data.currentToken
      );

      refreshDashboard();

    } catch (error) {

      showNotification("No patients waiting", "error");

    }

    setLoading(false);

  };

  const startClinic = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/patients/open-clinic`);
      setClinicStatus("OPEN");
      refreshDashboard();
      showNotification("Clinic session started successfully.", "success");
    } catch (error) {
      console.log(error);
      showNotification("Error starting clinic session", "error");
    }
  };

  const endClinic = async () => {

    const confirmEnd = window.confirm(
      "Are you sure you want to close today's clinic?"
    );

    if (!confirmEnd) return;

    try {

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/patients/end-clinic`
      );

      setClinicStatus("CLOSED");

      showNotification(res.data.message, "success");
      refreshDashboard();

    } catch (error) {

      console.log(error);

      showNotification("Error closing clinic", "error");

    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);



  const addPatient = async () => {
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 0) {
      showNotification("Age cannot be negative", "error");
      return;
    }
    const phoneClean = formData.phone.trim();
    if (!/^\d{10}$/.test(phoneClean)) {
      showNotification("Mobile number must be exactly 10 digits", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/patients/add`,
        formData
      );

      showNotification(`Patient Added: ${res.data.tokenNumber}`, "success");

      setFormData({
        name: "",
        age: "",
        phone: "",
        priority: "Normal",
      });

      refreshDashboard();
    } catch (error) {
      console.log(error);
      showNotification("Error adding patient", "error");
    }
  };

  const fetchCurrentToken = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/patients/current-token`
      );

      if (res.data) {
        setCurrentToken(res.data.currentToken || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const completePatient = async (id) => {

    try {

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/patients/complete/${id}`
      );

      refreshDashboard();

    } catch (error) {

      console.log(error);

    }

  };

  const skipPatient = async (id) => {

    try {

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/patients/skip/${id}`
      );

      refreshDashboard();

    } catch (error) {

      console.log(error);

    }

  };

  const recallPatient = async (id) => {

    try {

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/patients/recall/${id}`
      );

      refreshDashboard();

    } catch (error) {

      console.log(error);

    }

  };

  const today = new Date();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalPatients =
    patients.length;

  const waitingPatients =
    patients.filter(
      p => p.status === "Waiting"
    ).length;

  const calledPatients =
    patients.filter(
      p => p.status === "Called"
    ).length;

  const completedPatients =
    patients.filter(
      p => p.status === "Completed"
    ).length;

  const skippedPatients =
    patients.filter(
      p => p.status === "Skipped"
    ).length;

  const emergencyPatients =
    patients.filter(
      p => p.priority === "Emergency"
    ).length;

  const currentDate =
    today.toLocaleDateString("en-IN");

  const currentDay =
    today.toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "dashboard";

  const darkMode = localStorage.getItem("darkMode") === "true";

  return (
    <div className={darkMode ? "dashboard-layout dark-mode" : "dashboard-layout"}>
      <Sidebar />
      <div className="main-content" style={{ overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
        <Topbar clinicStatus={clinicStatus} />

        {view === "reception" ? (
          /* Receptionist View: Register Patient + Patient Queue status overview */
          <div className="dashboard-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", marginTop: "20px" }}>
            
            {/* Register Patient Form */}
            <div className="form-card">
              <div style={{ marginBottom: "20px" }}>
                <h2>Register Patient</h2>
                <p style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  Add a patient to today's queue
                </p>
              </div>

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: darkMode ? "#94a3b8" : "#64748b", marginTop: "14px" }}>
                Patient Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Patient Name"
                value={formData.name}
                onChange={handleChange}
                disabled={clinicStatus === "CLOSED"}
                style={{ marginTop: "6px" }}
              />

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: darkMode ? "#94a3b8" : "#64748b", marginTop: "14px" }}>
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                disabled={clinicStatus === "CLOSED"}
                style={{ marginTop: "6px" }}
              />

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: darkMode ? "#94a3b8" : "#64748b", marginTop: "14px" }}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                disabled={clinicStatus === "CLOSED"}
                style={{ marginTop: "6px" }}
              />

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: darkMode ? "#94a3b8" : "#64748b", marginTop: "14px" }}>
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={clinicStatus === "CLOSED"}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                  background: darkMode ? "#1e293b" : "#ffffff",
                  color: darkMode ? "#f1f5f9" : "#1e293b"
                }}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>

              {clinicStatus === "CLOSED" ? (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <p style={{ color: "#ef4444", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>
                    ⚠️ Clinic is currently CLOSED
                  </p>
                  <button
                    className="primary-btn full-width"
                    onClick={startClinic}
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      boxShadow: "0 10px 15px -3px rgba(22, 163, 74, 0.3)",
                      padding: "14px",
                      fontWeight: "600",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Start New Session
                  </button>
                </div>
              ) : (
                <button
                  className="primary-btn full-width"
                  onClick={addPatient}
                  style={{ marginTop: "24px", padding: "14px", fontWeight: "600" }}
                >
                  Add Patient
                </button>
              )}
            </div>

            {/* Reception Queue status overview (No Doctor buttons) */}
            <div className="table-card">
              <div className="table-header" style={{ alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0 }}>Today's Queue</h2>
                  <p className="queue-count-subtext" style={{ margin: "4px 0 0 0", fontSize: "14px", fontWeight: "600" }}>
                    {patients.length} Patients
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search Patient"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-box"
                />
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    <th style={{ padding: "12px 8px" }}>Token</th>
                    <th style={{ padding: "12px 8px" }}>Name</th>
                    <th style={{ padding: "12px 8px" }}>Age</th>
                    <th style={{ padding: "12px 8px" }}>Priority</th>
                    <th style={{ padding: "12px 8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: darkMode ? "#94a3b8" : "#64748b", fontWeight: "600" }}>
                        No patients added yet
                      </td>
                    </tr>
                  ) : (
                    patients
                      .filter((patient) =>
                        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        patient.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        patient.phone.includes(searchTerm)
                      )
                      .map((patient) => (
                        <tr
                          key={patient._id}
                          style={{ borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9", color: darkMode ? "#f1f5f9" : "#1e293b" }}
                        >
                          <td style={{ padding: "12px 8px", fontWeight: "600" }}>{patient.tokenNumber}</td>
                          <td style={{ padding: "12px 8px" }}>{patient.name}</td>
                          <td style={{ padding: "12px 8px" }}>{patient.age}</td>
                          <td style={{ padding: "12px 8px" }}>
                            <span className={`priority-badge ${patient.priority.toLowerCase()}`}>
                              {patient.priority}
                            </span>
                          </td>
                          <td style={{ padding: "12px 8px" }}>
                            <span className={`status-badge ${patient.status.toLowerCase()}`}>
                              {patient.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          /* Doctor's Dashboard View: Stats Grid + Now Serving + Settings + Queue list with full actions */
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="👥 Total Patients"
                value={totalPatients}
              />

              <StatCard
                title="⏳ Waiting"
                value={waitingPatients}
              />

              <StatCard
                title="📢 Called"
                value={calledPatients}
              />

              <StatCard
                title="✅ Completed"
                value={completedPatients}
              />

              <StatCard
                title="🚫 Skipped"
                value={skippedPatients}
              />

              <StatCard
                title="🚨 Emergency"
                value={emergencyPatients}
              />

              {localStorage.getItem("showWaitTime") !== "false" && (
                <StatCard
                  title="⏳ Est. Wait Time"
                  value={formatWaitTime(Math.round(waitingPatients * (dynamicAvgTime !== null ? dynamicAvgTime : 10)))}
                  subtext={dynamicAvgTime !== null ? `Live: ${dynamicAvgTime}m/pat` : `Default: 10m/pat`}
                />
              )}
            </div>

            <div className="dashboard-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
              
              {/* Doctor Quick Actions and Settings */}
              <div>
                {/* Now Serving Widget */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #1e40af, #2563eb)",
                    color: "white",
                    padding: "30px",
                    borderRadius: "20px",
                    textAlign: "center",
                    marginBottom: "25px",
                    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.15)"
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", letterSpacing: "0.1em", opacity: 0.9 }}>
                    NOW SERVING
                  </h3>
                  <h1 style={{ fontSize: "70px", margin: 0, fontWeight: "900", lineHeight: 1, textShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
                    {currentToken || "--"}
                  </h1>
                  <div style={{ marginTop: "24px" }}>
                    <button
                      className="primary-btn"
                      onClick={callNextPatient}
                      disabled={loading}
                      style={{
                        background: "white",
                        color: "#1e40af",
                        fontWeight: "700",
                        padding: "12px 24px",
                        borderRadius: "12px",
                        border: "none",
                        width: "100%",
                        fontSize: "15px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      {loading ? "Calling..." : "Call Next Patient"}
                    </button>
                  </div>
                </div>

                {/* Clinic Status Widget */}
                <div className="form-card" style={{ padding: "20px" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Session Status</h3>
                  <div style={{
                    background: clinicStatus === "OPEN" ? "#dcfce7" : "#fee2e2",
                    color: clinicStatus === "OPEN" ? "#166534" : "#991b1b",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    display: "inline-block"
                  }}>
                    {clinicStatus === "OPEN" ? "🟢 OPEN" : "🔴 CLOSED"}
                  </div>
                  <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b", lineHeight: 1.4 }}>
                    {clinicStatus === "OPEN" 
                      ? "The clinic is open. Patients can register and be called to the cabin."
                      : "The session is ended. Patient registration is closed."
                    }
                  </p>
                </div>
              </div>

              {/* Patient Queue list with actions */}
              <div className="table-card">
                <div className="table-header">
                  <h2>Patient Queue</h2>
                  <input
                    type="text"
                    placeholder="Search Patient"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-box"
                  />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                      <th style={{ padding: "12px 8px" }}>Token</th>
                      <th style={{ padding: "12px 8px" }}>Name</th>
                      <th style={{ padding: "12px 8px" }}>Age</th>
                      <th style={{ padding: "12px 8px" }}>Priority</th>
                      <th style={{ padding: "12px 8px" }}>Status</th>
                      <th style={{ padding: "12px 8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: darkMode ? "#94a3b8" : "#64748b", fontWeight: "600" }}>
                          No patients added yet
                        </td>
                      </tr>
                    ) : (
                      patients
                        .filter((patient) =>
                          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.phone.includes(searchTerm)
                        )
                        .map((patient) => (
                          <tr
                            key={patient._id}
                            style={{ borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9", color: darkMode ? "#f1f5f9" : "#1e293b" }}
                          >
                            <td style={{ padding: "12px 8px", fontWeight: "600" }}>{patient.tokenNumber}</td>
                            <td style={{ padding: "12px 8px" }}>{patient.name}</td>
                            <td style={{ padding: "12px 8px" }}>{patient.age}</td>
                            <td style={{ padding: "12px 8px" }}>
                              <span className={`priority-badge ${patient.priority.toLowerCase()}`}>
                                {patient.priority}
                              </span>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              <span className={`status-badge ${patient.status.toLowerCase()}`}>
                                {patient.status}
                              </span>
                            </td>
                            <td style={{ padding: "12px 8px" }}>
                              {patient.status === "Called" && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    className="complete-btn"
                                    onClick={() => completePatient(patient._id)}
                                  >
                                    Complete
                                  </button>
                                  <button
                                    className="skip-btn"
                                    onClick={() => skipPatient(patient._id)}
                                  >
                                    Skip
                                  </button>
                                </div>
                              )}

                              {patient.status === "Skipped" && (
                                <button
                                  className="primary-btn"
                                  onClick={() => recallPatient(patient._id)}
                                >
                                  Recall
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
              {clinicStatus === "OPEN" ? (
                <button className="danger-btn" onClick={endClinic}>
                  End Clinic
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={startClinic}
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    boxShadow: "0 10px 15px -3px rgba(22, 163, 74, 0.3)",
                    padding: "12px 24px",
                    fontWeight: "600",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Start New Session
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "ℹ️"}</span>
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default App;