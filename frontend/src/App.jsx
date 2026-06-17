import {
  useState,
  useEffect
} from "react";

import {
  useNavigate
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

  const [avgTime,
    setAvgTime] = useState(

      localStorage.getItem(
        "avgTime"
      ) || 10

    );

  const callNextPatient = async () => {

    if (loading) return;

    setLoading(true);

    try {

      const res =
        await axios.post(
          "http://localhost:5000/api/patients/call-next"
        );

      setCurrentToken(
        res.data.currentToken
      );

      fetchPatients();

      fetchCurrentToken();

    } catch (error) {

      alert(
        "No patients waiting"
      );

    }

    setLoading(false);

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

  useEffect(() => {

    localStorage.setItem(
      "avgTime",
      avgTime
    );

  }, [avgTime]);

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

  const completePatient = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/patients/complete/${id}`
      );

      fetchPatients();

    } catch (error) {

      console.log(error);

    }

  };

  const skipPatient = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/patients/skip/${id}`
      );

      fetchPatients();

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

  return (
    <div style={{ padding: "30px" }}>
      <h1>Queue Cure</h1>
      <h3>Date: {currentDate}</h3>
      <h3>Day: {currentDay}</h3>

      <h3>
        Clinic Status: {clinicStatus}
      </h3>

      <hr />

      <h2>
        Today's Summary
      </h2>

      <p>
        Total Patients:
        {totalPatients}
      </p>

      <p>
        Waiting:
        {waitingPatients}
      </p>

      <p>
        Called:
        {calledPatients}
      </p>

      <p>
        Completed:
        {completedPatients}
      </p>

      <p>
        Skipped:
        {skippedPatients}
      </p>

      <p>
        Emergency:
        {emergencyPatients}
      </p>

      <hr />

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

      <div>

        <label>
          Avg Consultation Time (mins):
        </label>

        <input
          type="number"
          value={avgTime}
          onChange={(e) =>
            setAvgTime(e.target.value)
          }
          style={{
            marginLeft: "10px"
          }}
        />

      </div>

      <br />

      <button
        onClick={callNextPatient}
        disabled={loading}
      >
        {
          loading
            ? "Calling..."
            : "Call Next Patient"
        }
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

      <button
        onClick={() =>
          navigate("/history")
        }
        style={{
          marginLeft: "10px"
        }}
      >
        View History
      </button>

      <input
        type="text"
        placeholder="Search Patient"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
      />

      <br /><br />

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
          {patients
            .filter((patient) =>

              patient.name
                .toLowerCase()
                .includes(
                  searchTerm.toLowerCase()
                )

              ||

              patient.tokenNumber
                .toLowerCase()
                .includes(
                  searchTerm.toLowerCase()
                )

              ||

              patient.phone.includes(
                searchTerm
              )
            )
            .map((patient) => (

              <tr key={patient._id}>
                <td>{patient.tokenNumber}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.phone}</td>
                <td>

                  <span
                    style={{
                      color:
                        patient.priority ===
                          "Emergency"
                          ? "red"
                          :
                          patient.priority ===
                            "Urgent"
                            ? "orange"
                            : "green",

                      fontWeight:
                        "bold"
                    }}
                  >

                    {patient.priority}

                  </span>

                </td>
                <td>

                  {patient.status}

                  {patient.status === "Called" && (

                    <>

                      <button
                        onClick={() =>
                          completePatient(
                            patient._id
                          )
                        }
                        style={{
                          marginLeft: "10px"
                        }}
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          skipPatient(
                            patient._id
                          )
                        }
                        style={{
                          marginLeft: "10px"
                        }}
                      >
                        Skip
                      </button>

                    </>

                  )}

                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;