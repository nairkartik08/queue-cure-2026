import { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";

function WaitingRoom() {

    const [
        currentToken,
        setCurrentToken
    ] = useState("");

    const [
        patientsAhead,
        setPatientsAhead
    ] = useState(0);

    const [
        avgTime
    ] = useState(

        localStorage.getItem(
            "avgTime"
        ) || 10

    );

    const fetchPatientsAhead = async () => {

        try {

            const res = await axios.get(
                "http://localhost:5000/api/patients/patients-ahead"
            );

            setPatientsAhead(
                res.data.patientsAhead
            );

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

            setCurrentToken(
                res.data.currentToken || ""
            );

        }

    } catch (error) {

        console.log(error);

    }

};

    useEffect(() => {

    fetchCurrentToken();

    fetchPatientsAhead();

    socket.on(
        "tokenUpdated",
        (data) => {

            setCurrentToken(
                data.currentToken
            );

            fetchPatientsAhead();

            const speech = new SpeechSynthesisUtterance(
                `Attention please. Token ${data.currentToken}. Please proceed to the doctor.`
            );

            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;

            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(
                speech
            );

        }
    );

    return () => {

        socket.off(
            "tokenUpdated"
        );

    };

}, []);

    const estimatedWait =

        patientsAhead * avgTime;

    return (

        <div
            style={{
                textAlign: "center",
                marginTop: "100px"
            }}
        >

            <h1>
                Waiting Room
            </h1>

            <h2>
                Now Serving
            </h2>

            <h1
                style={{
                    fontSize: "120px",
                    color: "green"
                }}
            >
                {currentToken}
            </h1>

            <h2
                style={{
                    fontSize: "40px"
                }}
            >
                Patients Ahead:
                {patientsAhead}
            </h2>

            <h2>
                Estimated Wait:
                {estimatedWait} mins
            </h2>

        </div>

    );
}

export default WaitingRoom;

