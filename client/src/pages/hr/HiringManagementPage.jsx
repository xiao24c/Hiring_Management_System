import { useEffect, useState } from "react";
import api from "../../services/api.js";

const statusLabels = {
  pending: "Pending",
  rejected: "Rejected",
  approved: "Approved"
};

const HiringManagementPage = () => {
  const [tokens, setTokens] = useState([]);
  const [tokenForm, setTokenForm] = useState({ name: "", email: "" });
  const [tokenMessage, setTokenMessage] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [applications, setApplications] = useState({ pending: [], rejected: [], approved: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tokensRes, pendingRes, rejectedRes, approvedRes] = await Promise.all([
        api.get("/hr/tokens"),
        api.get("/hr/onboarding", { params: { status: "pending" } }),
        api.get("/hr/onboarding", { params: { status: "rejected" } }),
        api.get("/hr/onboarding", { params: { status: "approved" } })
      ]);
      setTokens(tokensRes.data.history);
      setApplications({
        pending: pendingRes.data.applications,
        rejected: rejectedRes.data.applications,
        approved: approvedRes.data.applications
      });
    } catch (error) {
      console.error("Failed to load hiring data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTokenSubmit = async (event) => {
    event.preventDefault();
    setTokenMessage(null);
    setGeneratedToken(null);
    try {
      const response = await api.post("/hr/token", tokenForm);
      setGeneratedToken(response.data?.token || null);
      setTokenMessage({ type: "success", text: "Registration token generated. Share it below." });
      setTokenForm({ name: "", email: "" });
      await loadData();
    } catch (error) {
      setTokenMessage({ type: "error", text: error.response?.data?.message || "Unable to generate token." });
    }
  };

  return (
    <section className="page-card">
      <h1 className="page-title">Hiring Management</h1>

      <div className="section-card">
        <div className="section-card__header">
          <h3>Registration Tokens</h3>
        </div>
        <form className="form-grid" onSubmit={handleTokenSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input value={tokenForm.name} onChange={(e) => setTokenForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={tokenForm.email}
              onChange={(e) => setTokenForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          {generatedToken && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#f3f4f6",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.95rem"
              }}
            >
              <p style={{ margin: "0 0 0.25rem" }}>
                <strong>Registration Token:</strong> <code>{generatedToken.value}</code>
              </p>
              <p style={{ margin: 0 }}>
                <strong>Registration Link:</strong>{" "}
                <a href={generatedToken.registrationLink} target="_blank" rel="noreferrer">
                  {generatedToken.registrationLink}
                </a>
              </p>
            </div>
          )}
          <button className="primary-button" type="submit">
            Generate token
          </button>
        </form>
        {tokenMessage && (
          <p style={{ color: tokenMessage.type === "error" ? "#b91c1c" : "#15803d" }}>{tokenMessage.text}</p>
        )}
        <h4 style={{ marginTop: "1.5rem" }}>History</h4>
        {tokens.length === 0 ? (
          <p>No tokens generated yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th>Onboarding Submitted?</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td>{token.name || "--"}</td>
                    <td>{token.email}</td>
                    <td>
                      <a href={token.registrationLink} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    </td>
                    <td>{token.status}</td>
                    <td>{token.onboardingSubmitted ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <h3>Onboarding Application Review</h3>
        {loading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="hr-accordion">
            {Object.entries(applications).map(([status, items]) => (
              <div key={status} style={{ marginBottom: "1.5rem" }}>
                <h4>
                  {statusLabels[status]} ({items.length})
                </h4>
                {items.length === 0 ? (
                  <p>No applications.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.userId}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "--"}</td>
                          <td>
                            <a href={`/hr/onboarding/${item.userId}`} target="_blank" rel="noreferrer">
                              View Application
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HiringManagementPage;
