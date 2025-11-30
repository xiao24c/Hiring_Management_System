import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const Layout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="app-content">
      <Outlet />
    </main>
  </div>
);

export default Layout;
