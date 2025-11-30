import { useEffect, useMemo, useState } from "react";
import useDebounce from "../../hooks/useDebounce.js";
import api, { getAssetUrl } from "../../services/api.js";
import DocumentList from "../../components/DocumentList.jsx";
import { formatDate } from "../../utils/format.js";

const VisaManagementPage = () => {
  const [activeTab, setActiveTab] = useState("inProgress");
  const [inProgress, setInProgress] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [searchAll, setSearchAll] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const debouncedSearch = useDebounce(searchAll);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [notificationNotes, setNotificationNotes] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [progressRes, allRes] = await Promise.all([
        api.get("/hr/visa/in-progress"),
        api.get("/hr/visa/all")
      ]);
      setInProgress(progressRes.data.employees);
      setAllRecords(allRes.data.records);
    } catch (error) {
      console.error("Failed to load visa data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAll = useMemo(() => {
    if (!debouncedSearch) return allRecords;
    const query = debouncedSearch.toLowerCase();
    return allRecords.filter((record) => record.name.toLowerCase().includes(query));
  }, [allRecords, debouncedSearch]);

  const handleDocumentDecision = async (userId, type, status, feedback) => {
    try {
      await api.patch(`/hr/visa/documents/${userId}/${type}`, { status, feedback });
      setMessage({ type: "success", text: `Document marked as ${status}` });
      await loadData();
      setDecisionNotes((prev) => {
        const key = `${userId}-${type}`;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to update document." });
    }
  };

  const handleNotify = async (userId, note) => {
    try {
      await api.post(`/hr/visa/notify/${userId}`, { message: note });
      setMessage({ type: "success", text: "Notification sent" });
      await loadData();
      setNotificationNotes((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to send notification." });
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <p>Loading visa records...</p>
      </div>
    );
  }

  return (
    <section className="page-card">
      <h1 className="page-title">Visa Status Management</h1>
      {message && (
        <p style={{ color: message.type === "error" ? "#b91c1c" : "#15803d" }}>{message.text}</p>
      )}
      <div className="tab-buttons" style={{ marginBottom: "1rem" }}>
        <button className={activeTab === "inProgress" ? "active" : ""} onClick={() => setActiveTab("inProgress")}>
          In Progress
        </button>
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
          All
        </button>
      </div>

      {activeTab === "inProgress" ? (
        inProgress.length === 0 ? (
          <p>No OPT workflows in progress.</p>
        ) : (
          <div className="card-list">
            {inProgress.map((employee) => (
              <div key={employee.userId} className="hr-card">
                <h3>{employee.name}</h3>
                <p>Authorization: {employee.workAuthorization || "--"}</p>
                <p>
                  Start: {formatDate(employee.startDate)} – End: {formatDate(employee.endDate)}
                </p>
                <p>Days Remaining: {employee.daysRemaining ?? "--"}</p>
                <p><strong>Next Step:</strong> {employee.nextStep}</p>
                {employee.action === "review" && employee.pendingDocument && (
                  <div className="section-card" style={{ marginTop: "1rem" }}>
                    <h4>Pending Document: {employee.pendingDocument.type.toUpperCase()}</h4>
                    <iframe
                      title={`${employee.pendingDocument.type}-preview`}
                      src={getAssetUrl(employee.pendingDocument.url)}
                      style={{ width: "100%", height: "260px", border: "1px solid var(--border)" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <textarea
                        placeholder="Optional feedback when rejecting"
                        value={decisionNotes[`${employee.userId}-${employee.pendingDocument.type}`] || ""}
                        onChange={(e) =>
                          setDecisionNotes((prev) => ({
                            ...prev,
                            [`${employee.userId}-${employee.pendingDocument.type}`]: e.target.value
                          }))
                        }
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="primary-button"
                          onClick={() => handleDocumentDecision(employee.userId, employee.pendingDocument.type, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="primary-button"
                          style={{ background: "#dc2626" }}
                          onClick={() =>
                            handleDocumentDecision(
                              employee.userId,
                              employee.pendingDocument.type,
                              "rejected",
                              decisionNotes[`${employee.userId}-${employee.pendingDocument.type}`]
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {employee.action === "notify" && (
                  <div className="section-card" style={{ marginTop: "1rem" }}>
                    <h4>Send Notification</h4>
                    <textarea
                      value={notificationNotes[employee.userId] ?? `Hello ${employee.name}, ${employee.nextStep}`}
                      onChange={(e) =>
                        setNotificationNotes((prev) => ({
                          ...prev,
                          [employee.userId]: e.target.value
                        }))
                      }
                    />
                    <button
                      className="primary-button"
                      style={{ marginTop: "0.5rem" }}
                      onClick={() =>
                        handleNotify(
                          employee.userId,
                          notificationNotes[employee.userId] ?? `Hello ${employee.name}, ${employee.nextStep}`
                        )
                      }
                    >
                      Send Reminder
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <input
            className="search-bar"
            placeholder="Search by name"
            value={searchAll}
            onChange={(e) => setSearchAll(e.target.value)}
          />
          {filteredAll.length === 0 ? (
            <p>No records.</p>
          ) : (
            filteredAll.map((record) => (
              <div key={record.userId} className="hr-card">
                <h3>{record.name}</h3>
                <p>Current Step: {record.currentStep}</p>
                <DocumentList documents={record.documents} />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default VisaManagementPage;
