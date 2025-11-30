import { useEffect, useState } from "react";
import api from "../../services/api.js";

const HomePage = () => {
  const [summary, setSummary] = useState({ employees: 0, pendingOnboarding: 0, tokensSent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [employeesRes, onboardingRes, tokensRes] = await Promise.all([
          api.get("/hr/employees"),
          api.get("/hr/onboarding", { params: { status: "pending" } }),
          api.get("/hr/tokens")
        ]);
        setSummary({
          employees: employeesRes.data.total,
          pendingOnboarding: onboardingRes.data.total,
          tokensSent: tokensRes.data.total
        });
      } catch (error) {
        console.error("Failed to load HR summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="page-card">
        <p>Loading overview...</p>
      </div>
    );
  }

  return (
    <section className="page-card">
      <h1 className="page-title">HR Home</h1>
      <p className="helper-text">Quick overview of the employee pipeline.</p>
      <div className="stat-grid">
        <div className="stat-card">
          <p>Total Employees</p>
          <strong>{summary.employees}</strong>
        </div>
        <div className="stat-card">
          <p>Pending Onboarding</p>
          <strong>{summary.pendingOnboarding}</strong>
        </div>
        <div className="stat-card">
          <p>Registration Links Sent</p>
          <strong>{summary.tokensSent}</strong>
        </div>
      </div>
      <div className="section-card" style={{ marginTop: "2rem" }}>
        <h3>Next Steps</h3>
        <ul>
          <li>Generate tokens for new hires under Hiring Management.</li>
          <li>Review submitted onboarding forms in Hiring Management.</li>
          <li>Track OPT workflows from Visa Status Management.</li>
          <li>Use Employee Profiles to open any employee record.</li>
        </ul>
      </div>
    </section>
  );
};

export default HomePage;
