import { useState, useEffect } from "react";
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/patients"
      );

      setPatients(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [currentToken, setCurrentToken] = useState("");

  const [clinicStatus, setClinicStatus] =
    useState("OPEN");

  const callNextPatient = async () => {
    try {

      const res = await axios.post(
        "http://localhost:5000/api/patients/call-next"
      );

      setCurrentToken(res.data.currentToken);

      fetchPatients();
      fetchCurrentToken();

    } catch (error) {
      alert("No patients waiting");
    }
  };

  const endClinic = async () => {

    const confirmEnd = window.confirm(
      "Are you sure you want to close today's clinic?"
    );

    if (!confirmEnd) return;

    try {

      const res = await axios.post(
        "http://localhost:5000/api/patients/end-clinic"
      );

      setClinicStatus("CLOSED");

      alert(res.data.message);

    } catch (error) {

      console.log(error);

      alert("Error closing clinic");

    }
  };

  useEffect(() => {
    fetchPatients();
    fetchCurrentToken();
  }, []);

  const addPatient = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/patients/add",
        formData
      );

      alert(`Patient Added: ${res.data.tokenNumber}`);

      setFormData({
        name: "",
        age: "",
        phone: "",
        priority: "Normal",
      });

      fetchPatients();
    } catch (error) {
      console.log(error);
      alert("Error adding patient");
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

  const today = new Date();

  const currentDate =
    today.toLocaleDateString("en-IN");

  const currentDay =
    today.toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Queue Cure</h1>
      <h3>Date: {currentDate}</h3>
      <h3>Day: {currentDay}</h3>

      <h3>
        Clinic Status: {clinicStatus}
      </h3>

      <input
        type="text"
        name="name"
        placeholder="Patient Name"
        value={formData.name}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
      />

      <br /><br />

      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
      >
        <option value="Normal">Normal</option>
        <option value="Urgent">Urgent</option>
        <option value="Emergency">Emergency</option>
      </select>

      <br /><br />

      <button onClick={addPatient}
      disabled={clinicStatus === "CLOSED"}>
        Add Patient
      </button>

      <hr />

      <h2>
        Current Token: {currentToken || "No Patient Called Yet"}
      </h2>

      <button onClick={callNextPatient}>
        Call Next Patient
      </button>

      <button
        onClick={endClinic}
        style={{
          marginLeft: "10px",
          backgroundColor: "red",
          color: "white"
        }}
      >
        End Clinic
      </button>

      <h2>Patient List</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Token</th>
            <th>Name</th>
            <th>Age</th>
            <th>Phone</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.tokenNumber}</td>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.phone}</td>
              <td>{patient.priority}</td>
              <td>{patient.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;