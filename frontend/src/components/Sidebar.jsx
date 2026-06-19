import { Link, useLocation } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiClock,
    FiBarChart2,
    FiSettings
} from "react-icons/fi";

function Sidebar() {
    const location = useLocation();

    const isDashboard = location.pathname === "/" && (location.search === "?view=dashboard" || location.search === "");
    const isReception = location.pathname === "/" && location.search === "?view=reception";

    return (
        <div className="sidebar">
            <h2 className="logo">
                Queue Cure
            </h2>

            <nav>
                <Link to="/?view=dashboard" className={isDashboard ? "active" : ""}>
                    <FiHome />
                    Dashboard
                </Link>

                <Link to="/?view=reception" className={isReception ? "active" : ""}>
                    <FiUsers />
                    Reception
                </Link>

                <Link to="/history" className={location.pathname === "/history" ? "active" : ""}>
                    <FiClock />
                    History
                </Link>

                <Link to="/analytics" className={location.pathname === "/analytics" ? "active" : ""}>
                    <FiBarChart2 />
                    Analytics
                </Link>

                <Link to="/waiting-room" className={location.pathname === "/waiting-room" ? "active" : ""}>
                    <FiUsers />
                    Waiting Room
                </Link>

                <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
                    <FiSettings />
                    Settings
                </Link>
            </nav>
        </div>
    );
}

export default Sidebar;