function Topbar({ clinicStatus }) {

    const today =
        new Date().toLocaleDateString(
            "en-IN"
        );

    return (

        <div className="topbar">

            <div>

                <h2>
                    {
                        localStorage.getItem(
                            "clinicName"
                        )
                        ||
                        "Queue Cure Clinic"
                    }
                </h2>

                <p>
                    {today}
                </p>

            </div>

            <div
                className={
                    clinicStatus === "OPEN"
                        ? "status-open"
                        : "status-closed"
                }
            >
                {clinicStatus}
            </div>

            <div className="avatar">
                K
            </div>

        </div>

    );

}

export default Topbar;