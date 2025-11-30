import { useEffect, useMemo, useState } from "react";
import DocumentList from "../components/DocumentList.jsx";
import DocumentUpload from "../components/DocumentUpload.jsx";
import { useAuth } from "../hooks/useAuth.js";
import api, { getAssetUrl } from "../services/api.js";
import { visaSteps } from "../utils/constants.js";

const VisaStatusPage = () => {
  const { refreshEmployeeProfile } = useAuth();
  const [visaStatus, setVisaStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [visaRes, docsRes] = await Promise.all([
        api.get("/employee/visa-status"),
        api.get("/employee/documents")
      ]);
      setVisaStatus(visaRes.data);
      setDocuments(docsRes.data.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load visa status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visaDocuments = useMemo(() => documents.filter((doc) => doc.category === "visa"), [documents]);

  const handleUploaded = async () => {
    await loadData();
    await refreshEmployeeProfile();
  };

  if (loading) {
    return (
      <div className="page-card">
        <p>Loading visa status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-card">
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  if (!visaStatus?.requiresOpt) {
    return (
      <div className="page-card">
        <h1 className="page-title">Visa Status Management</h1>
        <p className="helper-text">You indicated that OPT tracking is not required.</p>
      </div>
    );
  }

  const getStep = (type) => visaStatus.documents.find((doc) => doc.type === type) || { status: "not_uploaded" };

  const canUpload = (type) => {
    const index = visaSteps.findIndex((step) => step.type === type);
    for (let i = 0; i < index; i++) {
      const step = getStep(visaSteps[i].type);
      if (step.status !== "approved") {
        return false;
      }
    }
    return true;
  };

  return (
    <section className="page-card">
      <h1 className="page-title">Visa Status Management</h1>
      <p className="helper-text">Track the status of each OPT document and upload new files when prompted.</p>
      <div className="section-card" style={{ background: "#eff6ff" }}>
        <strong>Current Step:</strong>{" "}
        {visaStatus.currentStep === "completed"
          ? "All documents approved"
          : visaSteps.find((step) => step.type === visaStatus.currentStep)?.title || visaStatus.currentStep}
        <p style={{ marginTop: "0.5rem" }}>{visaStatus.message}</p>
      </div>

      {visaSteps.map((step) => {
        const data = getStep(step.type);
        const allowUpload =
          canUpload(step.type) && (!["pending", "approved"].includes(data.status) || data.status === "rejected");
        return (
          <article key={step.type} className="section-card">
            <div className="section-card__header">
              <div>
                <h3>{step.title}</h3>
                <span className={`status-pill ${data.status}`}>{data.status}</span>
              </div>
            </div>
            <p>{step[data.status] || step.pending}</p>
            {data.feedback && <p className="helper-text">HR Feedback: {data.feedback}</p>}
            {step.type === "i_983" && (
              <div className="tag-list" style={{ marginTop: "0.75rem" }}>
                <a className="primary-button" href="/templates/i983-empty.pdf" download>
                  Empty Template
                </a>
                <a className="primary-button" href="/templates/i983-sample.pdf" download>
                  Sample Template
                </a>
              </div>
            )}
            {allowUpload && (
              <div style={{ marginTop: "1rem" }}>
                <DocumentUpload type={step.type} onUploaded={handleUploaded} />
              </div>
            )}
            {data.url && (
              <div style={{ marginTop: "0.5rem" }}>
                <a className="primary-button" href={getAssetUrl(data.url)} target="_blank" rel="noreferrer">
                  View Uploaded File
                </a>
              </div>
            )}
          </article>
        );
      })}

      <article className="section-card">
        <h3>Uploaded Visa Documents</h3>
        <DocumentList documents={visaDocuments} />
      </article>
    </section>
  );
};

export default VisaStatusPage;
