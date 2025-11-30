import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api.js";
import { formatDate } from "../../utils/format.js";

const Field = ({ label, value }) => (
  <div className="input-group">
    <label>{label}</label>
    <p>{value || "--"}</p>
  </div>
);

const OnboardingApplicationView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/hr/onboarding/${userId}`);
      setApplication(data);
    } catch (error) {
      console.error("Failed to fetch application", error);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [userId]);

  const handleDecision = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(`/hr/onboarding/${userId}`, { status, feedback });
      setMessage({ type: "success", text: `Application ${status}` });
      await loadApplication();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to update." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <p>Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="page-card">
        <p>Application not found.</p>
      </div>
    );
  }

  const { form, status, feedback: existingFeedback, name, email } = application;
  const canModerate = status === "pending";

  return (
    <section className="page-card">
      <button className="link-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className="page-title">{name}</h1>
      <p>
        <strong>Status:</strong> {status}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      {message && (
        <p style={{ color: message.type === "error" ? "#b91c1c" : "#15803d" }}>{message.text}</p>
      )}
      <div className="section-card">
        <h3>Personal Info</h3>
        <div className="form-grid">
          <Field label="First Name" value={form.personalInfo?.firstName} />
          <Field label="Middle Name" value={form.personalInfo?.middleName} />
          <Field label="Last Name" value={form.personalInfo?.lastName} />
          <Field label="Preferred Name" value={form.personalInfo?.preferredName} />
          <Field label="SSN" value={form.personalInfo?.ssn} />
          <Field label="Date of Birth" value={formatDate(form.personalInfo?.dateOfBirth)} />
          <Field label="Gender" value={form.personalInfo?.gender} />
        </div>
      </div>
      <div className="section-card">
        <h3>Address</h3>
        <p>
          {[form.address?.building, form.address?.street, form.address?.city, form.address?.state, form.address?.zip]
            .filter(Boolean)
            .join(", ") || "--"}
        </p>
      </div>
      <div className="section-card">
        <h3>Employment</h3>
        <div className="form-grid">
          <Field label="Work Authorization" value={form.employment?.workAuthorization} />
          <Field label="Visa Title" value={form.employment?.visaTitle} />
          <Field label="Start Date" value={formatDate(form.employment?.startDate)} />
          <Field label="End Date" value={formatDate(form.employment?.endDate)} />
        </div>
      </div>
      <div className="section-card">
        <h3>Contacts</h3>
        <Field label="Cell" value={form.contactInfo?.cellPhone} />
        <Field label="Work Phone" value={form.contactInfo?.workPhone} />
      </div>
      {form.reference && (
        <div className="section-card">
          <h3>Reference</h3>
          <p>
            {form.reference.firstName} {form.reference.lastName}
          </p>
          <p>Email: {form.reference.email}</p>
          <p>Phone: {form.reference.phone}</p>
          <p>Relationship: {form.reference.relationship}</p>
        </div>
      )}
      {Array.isArray(form.emergencyContacts) && form.emergencyContacts.length > 0 && (
        <div className="section-card">
          <h3>Emergency Contacts</h3>
          {form.emergencyContacts.map((contact, idx) => (
            <p key={idx}>
              {contact.firstName} {contact.lastName} – {contact.relationship} ({contact.phone})
            </p>
          ))}
        </div>
      )}

      {canModerate ? (
        <div className="section-card">
          <h3>Decision</h3>
          <textarea
            placeholder="Optional feedback when rejecting"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button className="primary-button" disabled={saving} onClick={() => handleDecision("approved")}>
              Approve
            </button>
            <button
              className="primary-button"
              style={{ background: "#dc2626" }}
              disabled={saving}
              onClick={() => handleDecision("rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        existingFeedback && (
          <div className="section-card">
            <h3>HR Feedback</h3>
            <p>{existingFeedback}</p>
          </div>
        )
      )}
    </section>
  );
};

export default OnboardingApplicationView;
