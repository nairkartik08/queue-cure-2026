import { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";

function WaitingRoom() {
    const [currentToken, setCurrentToken] = useState("");
    const [patientsAhead, setPatientsAhead] = useState(0);
    const [dynamicAvgTime, setDynamicAvgTime] = useState(null);
    const [isVoiceActivated, setIsVoiceActivated] = useState(true);
    const [isFlashing, setIsFlashing] = useState(false);

    const fetchPatientsAhead = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/patients/patients-ahead"
            );
            setPatientsAhead(res.data.patientsAhead);
            if (res.data.dynamicAvgTime !== undefined) {
                setDynamicAvgTime(res.data.dynamicAvgTime);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCurrentToken = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/patients/current-token"
            );
            if (res.data) {
                setCurrentToken(res.data.currentToken || "");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const activateVoice = () => {
        setIsVoiceActivated(true);
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance("Voice announcements activated.");
        speech.lang = "en-US";
        speech.rate = 1.0;
        speech.pitch = 1;
        speech.volume = 1;
        window.speechSynthesis.speak(speech);
    };

    useEffect(() => {
        fetchCurrentToken();
        fetchPatientsAhead();

        console.log("WaitingRoom Mounted");

        socket.on("connect", () => {
            console.log("Socket Connected:", socket.id);
        });

        console.log("Registering tokenUpdated listener");
        socket.on("tokenUpdated", (data) => {
            console.log("Voice Triggered", data.currentToken);
            if (!data.currentToken) {
                setCurrentToken("");
                fetchPatientsAhead();
                return;
            }
            setCurrentToken(data.currentToken);
            fetchPatientsAhead();

            // Trigger visual glow & scale animation
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 1000);

            const voiceEnabled = localStorage.getItem("voiceEnabled");
            if (voiceEnabled === null || voiceEnabled === "true") {
                window.speechSynthesis.cancel();
                
                const template = localStorage.getItem("voiceTemplate") || "Attention please. Token {token}. Please proceed to {cabin}.";
                const cabin = localStorage.getItem("cabinNumber") || "Cabin 1";
                const doctor = localStorage.getItem("doctorName") || "Dr. Smith";
                
                let message = template
                    .replace("{token}", data.currentToken)
                    .replace("{cabin}", cabin)
                    .replace("{doctor}", doctor);

                const speech = new SpeechSynthesisUtterance(message);
                
                // Select custom voice from settings
                const voiceName = localStorage.getItem("voiceName");
                if (voiceName) {
                    const voices = window.speechSynthesis.getVoices();
                    const voice = voices.find(v => v.name === voiceName);
                    if (voice) {
                        speech.voice = voice;
                    }
                }
                
                speech.pitch = parseFloat(localStorage.getItem("voicePitch") || 1.0);
                speech.rate = parseFloat(localStorage.getItem("voiceRate") || 0.9);
                speech.volume = 1.0;

                setTimeout(() => {
                    window.speechSynthesis.speak(speech);
                }, 100);
            }
        });

        return () => {
            socket.off("tokenUpdated");
        };
    }, []);

    const formatWaitTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} mins`;
        }
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
    };

    const showWaitTimeSetting = localStorage.getItem("showWaitTime") !== "false";
    const activeAvgTime = dynamicAvgTime !== null ? dynamicAvgTime : 10;
    const estimatedWait = Math.round(patientsAhead * activeAvgTime);

    const waitTimeText = dynamicAvgTime !== null
        ? `Based on today's average of ${dynamicAvgTime} mins/patient`
        : `Based on default setting of 10 mins/patient`;

    return (
        <div
            onClick={!isVoiceActivated ? activateVoice : undefined}
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f7fc",
                position: "relative",
                fontFamily: "'Outfit', 'Inter', sans-serif",
                cursor: !isVoiceActivated ? "pointer" : "default",
                padding: "40px 20px",
                boxSizing: "border-box"
            }}
        >
            {/* Status indicator badge */}
            <div
                onClick={!isVoiceActivated ? activateVoice : undefined}
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: isVoiceActivated ? "#dcfce7" : "#fee2e2",
                    color: isVoiceActivated ? "#166534" : "#991b1b",
                    padding: "10px 20px",
                    borderRadius: "30px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    cursor: !isVoiceActivated ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    zIndex: 1000
                }}
            >
                {isVoiceActivated ? "🔊 Voice Active" : "🔇 Click anywhere to activate voice audio"}
            </div>

            <h1 style={{ fontSize: "36px", color: "#0f172a", marginBottom: "30px", fontWeight: "800" }}>
                {localStorage.getItem("clinicName") || "Queue Cure Clinic"}
            </h1>

            <div
                style={{
                    background: isFlashing ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#1e40af",
                    color: "white",
                    padding: "50px 20px",
                    borderRadius: "25px",
                    width: "100%",
                    maxWidth: "500px",
                    textAlign: "center",
                    boxShadow: isFlashing
                        ? "0 0 60px rgba(59, 130, 246, 0.8)"
                        : "0 10px 30px rgba(0,0,0,0.15)",
                    transform: isFlashing ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    boxSizing: "border-box"
                }}
            >
                <h2 style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "0.1em", margin: "0 0 10px 0", opacity: 0.9 }}>
                    NOW SERVING
                </h2>
                <h1
                    style={{
                        fontSize: "min(130px, 24vw)",
                        margin: 0,
                        fontWeight: "900",
                        lineHeight: 1,
                        textShadow: "0 4px 15px rgba(0,0,0,0.25)"
                    }}
                >
                    {currentToken || "--"}
                </h1>
            </div>

            {/* Premium column layout for queue metrics */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "40px",
                    width: "100%",
                    maxWidth: "500px",
                    boxSizing: "border-box",
                    flexWrap: "wrap"
                }}
            >
                <div
                    style={{
                        flex: "1 1 200px",
                        background: "white",
                        borderRadius: "20px",
                        padding: "24px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                        border: "1px solid #e2e8f0",
                        textAlign: "center"
                    }}
                >
                    <span style={{ fontSize: "28px" }}>👥</span>
                    <h3 style={{ margin: "8px 0 4px 0", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Patients Waiting
                    </h3>
                    <div style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb" }}>
                        {patientsAhead}
                    </div>
                </div>

                {showWaitTimeSetting && (
                    <div
                        style={{
                            flex: "1 1 200px",
                            background: "white",
                            borderRadius: "20px",
                            padding: "24px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                        }}
                    >
                        <span style={{ fontSize: "28px" }}>⏳</span>
                        <h3 style={{ margin: "8px 0 4px 0", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Est. Wait Time
                        </h3>
                        <div style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a" }}>
                            {formatWaitTime(estimatedWait)}
                        </div>
                        <div style={{ fontSize: "13px", color: "#475569", marginTop: "5px", lineHeight: 1.2 }}>
                            {waitTimeText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WaitingRoom;


