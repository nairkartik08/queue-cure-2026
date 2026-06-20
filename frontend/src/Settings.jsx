import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./App.css";
import { FaClinicMedical, FaVolumeUp, FaSave, FaPlay } from "react-icons/fa";

function Settings() {
    const [clinicStatus, setClinicStatus] = useState("OPEN");

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );
    const [voiceEnabled, setVoiceEnabled] = useState(
        localStorage.getItem("voiceEnabled") !== "false"
    );
    const [showWaitTime, setShowWaitTime] = useState(
        localStorage.getItem("showWaitTime") !== "false"
    );

    // General Settings additions
    const [voiceChimeEnabled, setVoiceChimeEnabled] = useState(
        localStorage.getItem("voiceChimeEnabled") !== "false"
    );
    const [autoRefreshRate, setAutoRefreshRate] = useState(
        localStorage.getItem("autoRefreshRate") || "30"
    );

    // General Settings states (editable)
    const [clinicName, setClinicName] = useState(localStorage.getItem("clinicName") || "Queue Cure Clinic");
    const [doctorName, setDoctorName] = useState(localStorage.getItem("doctorName") || "Dr. Smith");
    const [cabinNumber, setCabinNumber] = useState(localStorage.getItem("cabinNumber") || "Cabin 1");

    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4000);
    };

    // Speech settings
    const [selectedVoiceName, setSelectedVoiceName] = useState(
        localStorage.getItem("voiceName") || ""
    );
    const [voicePitch, setVoicePitch] = useState(
        localStorage.getItem("voicePitch") || 1.0
    );
    const [voiceRate, setVoiceRate] = useState(
        localStorage.getItem("voiceRate") || 0.9
    );
    const [voiceTemplate, setVoiceTemplate] = useState(
        localStorage.getItem("voiceTemplate") || "Attention please. Token {token}. Please proceed to {cabin}."
    );

    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/session-status`);
                if (res.data) {
                    setClinicStatus(res.data.status);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchStatus();

        // Load speech synthesis voices
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
            
            const savedVoice = localStorage.getItem("voiceName");
            if (voices.length > 0 && !savedVoice) {
                const defaultVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
                setSelectedVoiceName(defaultVoice.name);
            }
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const testVoice = () => {
        window.speechSynthesis.cancel();
        
        let message = voiceTemplate
            .replace("{token}", "T-07")
            .replace("{cabin}", cabinNumber)
            .replace("{doctor}", doctorName);

        const speech = new SpeechSynthesisUtterance(message);
        
        if (selectedVoiceName) {
            const voice = availableVoices.find(v => v.name === selectedVoiceName);
            if (voice) {
                speech.voice = voice;
            }
        }
        
        speech.pitch = parseFloat(voicePitch);
        speech.rate = parseFloat(voiceRate);
        speech.volume = 1.0;
        
        window.speechSynthesis.speak(speech);
    };

    const handleResetToday = async () => {
        const confirmReset = window.confirm(
            "⚠️ WARNING: This will permanently delete ALL patients registered today and reset the queue token. Are you sure you want to proceed?"
        );
        if (!confirmReset) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/patients/reset-today`);
            showNotification("Today's clinic queue has been reset.", "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.log(e);
            showNotification("Error resetting queue", "error");
        }
    };

    const saveSettings = () => {
        localStorage.setItem("darkMode", darkMode);
        localStorage.setItem("voiceEnabled", voiceEnabled);
        localStorage.setItem("showWaitTime", showWaitTime);
        localStorage.setItem("voiceChimeEnabled", voiceChimeEnabled);
        localStorage.setItem("autoRefreshRate", autoRefreshRate);

        localStorage.setItem("clinicName", clinicName);
        localStorage.setItem("doctorName", doctorName);
        localStorage.setItem("cabinNumber", cabinNumber);

        localStorage.setItem("voiceName", selectedVoiceName);
        localStorage.setItem("voicePitch", voicePitch);
        localStorage.setItem("voiceRate", voiceRate);
        localStorage.setItem("voiceTemplate", voiceTemplate);

        showNotification("Settings Saved Successfully!", "success");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "14px",
        marginTop: "6px",
        boxSizing: "border-box",
        background: darkMode ? "#1e293b" : "#ffffff",
        color: darkMode ? "#f1f5f9" : "#1e293b"
    };

    const labelStyle = {
        fontSize: "13px",
        fontWeight: "600",
        color: darkMode ? "#94a3b8" : "#64748b",
        display: "block",
        marginTop: "14px"
    };

    const flexRowStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9"
    };

    const cardStyle = {
        background: darkMode ? "#1e293b" : "#ffffff",
        borderRadius: "20px",
        padding: "30px",
        border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
        marginBottom: "30px"
    };

    const renderToggle = (checked, onChange) => (
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)}
                style={{ display: "none" }}
            />
            <div style={{
                width: "48px",
                height: "26px",
                background: checked ? "#2563eb" : "#cbd5e1",
                borderRadius: "13px",
                position: "relative",
                transition: "background 0.2s ease"
            }}>
                <div style={{
                    width: "20px",
                    height: "20px",
                    background: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: checked ? "25px" : "3px",
                    transition: "left 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                }} />
            </div>
        </label>
    );

    return (
        <div className={darkMode ? "dashboard-layout dark-mode" : "dashboard-layout"}>
            <Sidebar />
            <div className="main-content" style={{ padding: "30px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
                <Topbar clinicStatus={clinicStatus} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px", marginTop: "20px" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "28px", color: darkMode ? "#f8fafc" : "#0f172a", fontWeight: "700" }}>
                            Settings
                        </h1>
                        <p style={{ margin: "5px 0 0 0", color: darkMode ? "#94a3b8" : "#64748b" }}>
                            Configure your clinic preferences and text-to-speech announcement engine
                        </p>
                    </div>
                    
                    <button
                        onClick={saveSettings}
                        style={{
                            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            color: "white",
                            border: "none",
                            padding: "12px 24px",
                            fontSize: "15px",
                            fontWeight: "600",
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        <FaSave /> Save Settings
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
                    
                    {/* Left Column: General Preferences */}
                    <div>
                        {/* General Settings Card */}
                        <div style={cardStyle}>
                            <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", color: darkMode ? "#f8fafc" : "#1e293b", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                                <FaClinicMedical style={{ color: "#2563eb" }} /> General Settings
                            </h2>

                            <div style={flexRowStyle}>
                                <div>
                                    <div style={{ fontWeight: "600", color: darkMode ? "#f1f5f9" : "#1e293b", fontSize: "14px" }}>Dark Mode</div>
                                    <div style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>Switch to a premium dark color interface</div>
                                </div>
                                {renderToggle(darkMode, setDarkMode)}
                            </div>

                            <div style={flexRowStyle}>
                                <div>
                                    <div style={{ fontWeight: "600", color: darkMode ? "#f1f5f9" : "#1e293b", fontSize: "14px" }}>Show Wait Time</div>
                                    <div style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>Display estimated wait time on waiting room screens</div>
                                </div>
                                {renderToggle(showWaitTime, setShowWaitTime)}
                            </div>

                            <div style={flexRowStyle}>
                                <div>
                                    <div style={{ fontWeight: "600", color: darkMode ? "#f1f5f9" : "#1e293b", fontSize: "14px" }}>Announcement Chime</div>
                                    <div style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>Play a chime sound before announcements</div>
                                </div>
                                {renderToggle(voiceChimeEnabled, setVoiceChimeEnabled)}
                            </div>

                            <div style={{ marginTop: "15px" }}>
                                <label style={labelStyle}>Clinic Name</label>
                                <input 
                                    type="text"
                                    value={clinicName} 
                                    onChange={(e) => setClinicName(e.target.value)} 
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginTop: "15px" }}>
                                <label style={labelStyle}>Doctor Name</label>
                                <input 
                                    type="text"
                                    value={doctorName} 
                                    onChange={(e) => setDoctorName(e.target.value)} 
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginTop: "15px" }}>
                                <label style={labelStyle}>Cabin Number</label>
                                <input 
                                    type="text"
                                    value={cabinNumber} 
                                    onChange={(e) => setCabinNumber(e.target.value)} 
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginTop: "15px" }}>
                                <label style={labelStyle}>Dashboard Auto-Refresh Interval</label>
                                <select 
                                    value={autoRefreshRate} 
                                    onChange={(e) => setAutoRefreshRate(e.target.value)} 
                                    style={inputStyle}
                                >
                                    <option value="0">Manual Refresh Only</option>
                                    <option value="15">Every 15 seconds</option>
                                    <option value="30">Every 30 seconds</option>
                                    <option value="60">Every 60 seconds</option>
                                </select>
                            </div>

                            <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: darkMode ? "1px solid #334155" : "1px solid #f1f5f9" }}>
                                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#ef4444", fontWeight: "700" }}>
                                    ⚠️ System Maintenance
                                </h3>
                                <p style={{ margin: "0 0 15px 0", fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b", lineHeight: 1.4 }}>
                                    Clear all patients registered today and reset the queue token to empty. This cannot be undone.
                                </p>
                                <button
                                    onClick={handleResetToday}
                                    style={{
                                        background: "#fee2e2",
                                        color: "#991b1b",
                                        border: "1px solid #fca5a5",
                                        padding: "10px 20px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = "#fca5a5"}
                                    onMouseOut={(e) => e.currentTarget.style.background = "#fee2e2"}
                                >
                                    Reset Today's Queue
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Voice Announcements */}
                    <div>
                        <div style={cardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h2 style={{ margin: 0, fontSize: "18px", color: darkMode ? "#f8fafc" : "#1e293b", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <FaVolumeUp style={{ color: "#2563eb" }} /> Voice Announcements
                                </h2>
                                {renderToggle(voiceEnabled, setVoiceEnabled)}
                            </div>

                            {voiceEnabled && (
                                <div style={{ transition: "all 0.3s ease" }}>
                                    <label style={labelStyle}>Speech Engine Voice</label>
                                    <select 
                                        value={selectedVoiceName} 
                                        onChange={(e) => setSelectedVoiceName(e.target.value)} 
                                        style={inputStyle}
                                    >
                                        {availableVoices.map((voice) => (
                                            <option key={voice.name} value={voice.name}>
                                                {voice.name} ({voice.lang})
                                            </option>
                                        ))}
                                    </select>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "15px" }}>
                                        <div>
                                            <label style={labelStyle}>Pitch ({voicePitch})</label>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="2.0" 
                                                step="0.1" 
                                                value={voicePitch} 
                                                onChange={(e) => setVoicePitch(parseFloat(e.target.value))} 
                                                style={{ width: "100%", marginTop: "10px", accentColor: "#2563eb" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Speed Rate ({voiceRate})</label>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="1.5" 
                                                step="0.1" 
                                                value={voiceRate} 
                                                onChange={(e) => setVoiceRate(parseFloat(e.target.value))} 
                                                style={{ width: "100%", marginTop: "10px", accentColor: "#2563eb" }}
                                            />
                                        </div>
                                    </div>

                                    <label style={labelStyle}>Announcement Template</label>
                                    <textarea 
                                        value={voiceTemplate} 
                                        onChange={(e) => setVoiceTemplate(e.target.value)} 
                                        style={{ ...inputStyle, minHeight: "80px", fontFamily: "monospace", resize: "vertical" }}
                                        placeholder="Attention please. Token {token}. Please proceed to {cabin}."
                                    />
                                    <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: darkMode ? "#94a3b8" : "#64748b", lineHeight: 1.4 }}>
                                        Placeholders: <code>{`{token}`}</code> (Token Number), <code>{`{cabin}`}</code> (Cabin/Room), <code>{`{doctor}`}</code> (Doctor Name)
                                    </p>

                                    <button
                                        onClick={testVoice}
                                        style={{
                                            background: darkMode ? "#334155" : "#f1f5f9",
                                            color: darkMode ? "#f1f5f9" : "#1e293b",
                                            border: darkMode ? "1px solid #475569" : "1px solid #cbd5e1",
                                            padding: "10px 20px",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginTop: "20px",
                                            transition: "all 0.2s ease",
                                            width: "100%",
                                            justifyContent: "center"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = darkMode ? "#475569" : "#e2e8f0"}
                                        onMouseOut={(e) => e.currentTarget.style.background = darkMode ? "#334155" : "#f1f5f9"}
                                    >
                                        <FaPlay style={{ fontSize: "10px" }} /> Preview Voice Announcement
                                    </button>
                                </div>
                            )}

                            {!voiceEnabled && (
                                <div style={{ padding: "30px", textAlign: "center", color: darkMode ? "#94a3b8" : "#64748b", background: darkMode ? "#151e2c" : "#f8fafc", borderRadius: "15px", marginTop: "10px" }}>
                                    Voice Announcements are disabled. Turn them on to customize speech settings.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
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

export default Settings;