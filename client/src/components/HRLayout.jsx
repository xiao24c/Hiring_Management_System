import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import HRNavbar from "./HRNavbar.jsx";
import { useAuth } from "../hooks/useAuth.js";

const HRLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== "hr") {
      navigate("/personal-info", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== "hr") return null;

  return (
    <div className="app-shell">
      <HRNavbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default HRLayout;
