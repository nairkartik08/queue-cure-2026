import { useEffect, useState }
    from "react";

import axios
    from "axios";

function History() {

    const [
        patients,
        setPatients
    ] = useState([]);

    const groupedPatients =
        patients.reduce(
            (groups, patient) => {

                const date =
                    patient.visitDate;

                if (!groups[date]) {

                    groups[date] = [];

                }

                groups[date].push(patient);

                return groups;

            },
            {}
        );

    useEffect(() => {

        fetchHistory();

    }, []);

    const fetchHistory =
        async () => {

            try {

                const res =
                    await axios.get(
                        "http://localhost:5000/api/patients/history"
                    );

                setPatients(
                    res.data
                );

            } catch (error) {

                console.log(error);

            }

        };

    return (

        <div
            style={{
                padding: "30px"
            }}
        >

            <h1>
                Clinic History
            </h1>

            {
                Object.entries(
                    groupedPatients
                ).map(
                    ([date, patientList]) => (

                        <div
                            key={date}
                            style={{
                                marginBottom:
                                    "40px"
                            }}
                        >

                            <h2>
                                {date}
                                {" "}
                                (
                                {
                                    patientList[0]
                                        ?.dayName
                                }
                                )
                            </h2>

                            <p>

                                Total Patients:
                                {" "}
                                {
                                    patientList.length
                                }

                            </p>

                            <table
                                border="1"
                                cellPadding="10"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Token
                                        </th>

                                        <th>
                                            Name
                                        </th>

                                        <th>
                                            Priority
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        patientList.map(
                                            (
                                                patient
                                            ) => (

                                                <tr
                                                    key={
                                                        patient._id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            patient.tokenNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            patient.name
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            style={{
                                                                color:

                                                                    patient.priority ===
                                                                        "Emergency"

                                                                        ?

                                                                        "red"

                                                                        :

                                                                        patient.priority ===
                                                                            "Urgent"

                                                                            ?

                                                                            "orange"

                                                                            :

                                                                            "green",

                                                                fontWeight:
                                                                    "bold"
                                                            }}
                                                        >

                                                            {
                                                                patient.priority
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        {
                                                            patient.status
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )
                )
            }

        </div>

    );

}

export default History;