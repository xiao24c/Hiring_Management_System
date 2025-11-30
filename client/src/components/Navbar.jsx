import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const Navbar = () => {
  const { logout, employeeProfile } = useAuth();
  const navigate = useNavigate();
  const onboardingStatus = employeeProfile?.onboardingStatus;
  const shouldShowOnboarding = onboardingStatus && onboardingStatus !== "approved";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/personal-info")}>
        Hiring Portal
      </div>
      <nav className="navbar__links">
        {shouldShowOnboarding && (
          <NavLink to="/onboarding" className={({ isActive }) => (isActive ? "active" : "")}
          >
            Onboarding
          </NavLink>
        )}
        <NavLink to="/personal-info" className={({ isActive }) => (isActive ? "active" : "")}>
          Personal Info
        </NavLink>
        <NavLink to="/visa-status" className={({ isActive }) => (isActive ? "active" : "")}>
          Visa Status
        </NavLink>
        <button className="link-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
