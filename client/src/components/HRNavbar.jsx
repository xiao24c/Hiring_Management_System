import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const HRNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/hr")}>HR Console</div>
      <nav className="navbar__links">
        <NavLink to="/hr" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/hr/employees" className={({ isActive }) => (isActive ? "active" : "")}>
          Employee Profiles
        </NavLink>
        <NavLink to="/hr/visa" className={({ isActive }) => (isActive ? "active" : "")}>
          Visa Status Management
        </NavLink>
        <NavLink to="/hr/hiring" className={({ isActive }) => (isActive ? "active" : "")}>
          Hiring Management
        </NavLink>
        <button className="link-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default HRNavbar;
