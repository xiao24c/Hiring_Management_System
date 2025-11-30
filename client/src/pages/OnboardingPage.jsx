import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentList from "../components/DocumentList.jsx";
import DocumentUpload from "../components/DocumentUpload.jsx";
import { useAuth } from "../hooks/useAuth.js";
import api from "../services/api.js";
import { genderOptions, workAuthorizationOptions } from "../utils/constants.js";

const emptyContact = { firstName: "", lastName: "", middleName: "", phone: "", email: "", relationship: "" };

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const buildInitialForm = (profile, emailFallback) => {
  const source = profile?.onboardingApplication || profile?.profile || {};
  return {
    personalInfo: {
      firstName: source?.personalInfo?.firstName || "",
      lastName: source?.personalInfo?.lastName || "",
      middleName: source?.personalInfo?.middleName || "",
      preferredName: source?.personalInfo?.preferredName || "",
      email: source?.personalInfo?.email || emailFallback || "",
      ssn: source?.personalInfo?.ssn || "",
      dateOfBirth: toDateInput(source?.personalInfo?.dateOfBirth),
      gender: source?.personalInfo?.gender || "",
      citizenshipStatus: source?.personalInfo?.citizenshipStatus || ""
    },
    address: {
      building: source?.address?.building || "",
      street: source?.address?.street || "",
      city: source?.address?.city || "",
      state: source?.address?.state || "",
      zip: source?.address?.zip || ""
    },
    contactInfo: {
      cellPhone: source?.contactInfo?.cellPhone || "",
      workPhone: source?.contactInfo?.workPhone || ""
    },
    employment: {
      workAuthorization: source?.employment?.workAuthorization || "",
      workAuthorizationOther: source?.employment?.workAuthorizationOther || "",
      visaTitle: source?.employment?.visaTitle || "",
      startDate: toDateInput(source?.employment?.startDate),
      endDate: toDateInput(source?.employment?.endDate)
    },
    reference: source?.reference || { ...emptyContact },
    emergencyContacts: source?.emergencyContacts?.length
      ? source.emergencyContacts
      : [{ ...emptyContact }]
  };
};

const inferResidencyAnswer = (workAuth) => {
  if (["citizen", "green_card"].includes(workAuth)) return "yes";
  if (workAuth) return "no";
  return "";
};

const OnboardingPage = () => {
  const { user, employeeProfile, refreshEmployeeProfile } = useAuth();
  const navigate = useNavigate();
  const onboardingStatus = employeeProfile?.onboardingStatus || "never_submitted";
  const feedback = employeeProfile?.onboardingFeedback;
  const documents = employeeProfile?.documents || [];

  const [formData, setFormData] = useState(() => buildInitialForm(employeeProfile, user?.email));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [residencyAnswer, setResidencyAnswer] = useState(() =>
    inferResidencyAnswer(formData.employment.workAuthorization)
  );

  useEffect(() => {
    const updated = buildInitialForm(employeeProfile, user?.email);
    setFormData(updated);
    setResidencyAnswer(inferResidencyAnswer(updated.employment.workAuthorization));
  }, [employeeProfile, user?.email]);

  useEffect(() => {
    if (onboardingStatus === "approved") {
      navigate("/personal-info", { replace: true });
    }
  }, [onboardingStatus, navigate]);

  const readOnly = onboardingStatus === "pending";
  const requiresOpt = formData.employment.workAuthorization === "f1_opt";

  const updateField = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateEmergencyContact = (index, key, value) => {
    setFormData((prev) => {
      const list = prev.emergencyContacts.map((contact, idx) =>
        idx === index ? { ...contact, [key]: value } : contact
      );
      return { ...prev, emergencyContacts: list };
    });
  };

  const addEmergencyContact = () => {
    setFormData((prev) => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, { ...emptyContact }] }));
  };

  const removeEmergencyContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, idx) => idx !== index)
    }));
  };

  const onboardingDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        ["profile_picture", "drivers_license", "work_authorization", "opt_receipt"].includes(doc.type)
      ),
    [documents]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.post("/employee/onboarding", formData);
      setMessage({ type: "success", text: "Application submitted." });
      await refreshEmployeeProfile();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Unable to submit." });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUploaded = () => {
    refreshEmployeeProfile();
  };

  const handleResidencyChange = (value) => {
    setResidencyAnswer(value);
    if (value === "yes") {
      setFormData((prev) => ({
        ...prev,
        employment: { ...prev.employment, workAuthorization: "citizen", workAuthorizationOther: "" }
      }));
    } else if (value === "no") {
      setFormData((prev) => ({
        ...prev,
        employment: { ...prev.employment, workAuthorization: "", workAuthorizationOther: "" }
      }));
    }
  };

  const badgeMap = {
    never_submitted: "badge badge--pending",
    pending: "badge badge--pending",
    approved: "badge badge--approved",
    rejected: "badge badge--rejected"
  };
  const statusBadgeClass = badgeMap[onboardingStatus] || "badge";

  return (
    <div>
      <section className="page-card">
        <header className="section-card__header">
          <div>
            <h1 className="page-title">Onboarding Application</h1>
            <p className="helper-text">Submit your information and required documents for HR review.</p>
          </div>
          <span className={statusBadgeClass}>
            Status: {onboardingStatus.replace("_", " ")}
          </span>
        </header>
        {feedback && onboardingStatus === "rejected" && (
          <div className="section-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            <strong>HR Feedback</strong>
            <p>{feedback}</p>
          </div>
        )}
        {onboardingStatus === "pending" && (
          <div className="section-card" style={{ background: "#eff6ff" }}>
            <p>Please wait for HR to review your application. You can view the submitted data below.</p>
          </div>
        )}
        {message && (
          <p style={{ color: message.type === "error" ? "#b91c1c" : "#15803d" }}>{message.text}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="section-card">
            <div className="section-card__header">
              <h3>Personal Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>First Name *</label>
                <input
                  value={formData.personalInfo.firstName}
                  onChange={(e) => updateField("personalInfo", "firstName", e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Last Name *</label>
                <input
                  value={formData.personalInfo.lastName}
                  onChange={(e) => updateField("personalInfo", "lastName", e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Middle Name</label>
                <input
                  value={formData.personalInfo.middleName}
                  onChange={(e) => updateField("personalInfo", "middleName", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Preferred Name</label>
                <input
                  value={formData.personalInfo.preferredName}
                  onChange={(e) => updateField("personalInfo", "preferredName", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input value={formData.personalInfo.email} disabled />
              </div>
              <div className="input-group">
                <label>SSN</label>
                <input
                  value={formData.personalInfo.ssn}
                  onChange={(e) => updateField("personalInfo", "ssn", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => updateField("personalInfo", "dateOfBirth", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select
                  value={formData.personalInfo.gender}
                  onChange={(e) => updateField("personalInfo", "gender", e.target.value)}
                  disabled={readOnly}
                >
                  {genderOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Current Address</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Building / Apt #</label>
                <input
                  value={formData.address.building}
                  onChange={(e) => updateField("address", "building", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Street Name</label>
                <input
                  value={formData.address.street}
                  onChange={(e) => updateField("address", "street", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  value={formData.address.city}
                  onChange={(e) => updateField("address", "city", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>State</label>
                <input
                  value={formData.address.state}
                  onChange={(e) => updateField("address", "state", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Zip</label>
                <input
                  value={formData.address.zip}
                  onChange={(e) => updateField("address", "zip", e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Contact Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Cell Phone</label>
                <input
                  value={formData.contactInfo.cellPhone}
                  onChange={(e) => updateField("contactInfo", "cellPhone", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="input-group">
                <label>Work Phone</label>
                <input
                  value={formData.contactInfo.workPhone}
                  onChange={(e) => updateField("contactInfo", "workPhone", e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Employment & Visa</h3>
            </div>
            <div className="input-group">
              <label>Permanent resident or citizen of the U.S.?</label>
              <div className="tag-list">
                <label>
                  <input
                    type="radio"
                    name="residency"
                    checked={residencyAnswer === "yes"}
                    onChange={() => handleResidencyChange("yes")}
                    disabled={readOnly}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="residency"
                    checked={residencyAnswer === "no"}
                    onChange={() => handleResidencyChange("no")}
                    disabled={readOnly}
                  />
                  No
                </label>
              </div>
            </div>
            {residencyAnswer === "yes" && (
              <div className="input-group">
                <label>Select one</label>
                <select
                  value={formData.employment.workAuthorization}
                  onChange={(e) => updateField("employment", "workAuthorization", e.target.value)}
                  disabled={readOnly}
                >
                  {workAuthorizationOptions
                    .filter((option) => ["", "citizen", "green_card"].includes(option.value))
                    .map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {residencyAnswer === "no" && (
              <>
                <div className="input-group">
                  <label>What is your work authorization?</label>
                  <select
                    value={formData.employment.workAuthorization}
                    onChange={(e) => updateField("employment", "workAuthorization", e.target.value)}
                    disabled={readOnly}
                  >
                    {workAuthorizationOptions
                      .filter((option) => !["citizen", "green_card"].includes(option.value) || option.value === "")
                      .map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
                {formData.employment.workAuthorization === "other" && (
                  <div className="input-group">
                    <label>Visa title</label>
                    <input
                      value={formData.employment.workAuthorizationOther}
                      onChange={(e) => updateField("employment", "workAuthorizationOther", e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </>
            )}
            <div className="form-grid">
              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.employment.startDate}
                  onChange={(e) => updateField("employment", "startDate", e.target.value)}
                  disabled={readOnly}
                  required
                />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.employment.endDate}
                  onChange={(e) => updateField("employment", "endDate", e.target.value)}
                  disabled={readOnly}
                  required
                />
              </div>
              <div className="input-group">
                <label>Visa Title</label>
                <input
                  value={formData.employment.visaTitle}
                  onChange={(e) => updateField("employment", "visaTitle", e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Reference</h3>
            </div>
            <div className="form-grid">
              {Object.keys(emptyContact).map((field) => (
                <div className="input-group" key={field}>
                  <label>{field.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    value={formData.reference[field] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reference: { ...prev.reference, [field]: e.target.value }
                      }))
                    }
                    disabled={readOnly}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Emergency Contacts</h3>
              {!readOnly && (
                <button className="primary-button" type="button" onClick={addEmergencyContact}>
                  Add Contact
                </button>
              )}
            </div>
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="section-card" style={{ background: "#f8fafc" }}>
                <div className="form-grid">
                  {Object.keys(emptyContact).map((field) => (
                    <div className="input-group" key={field}>
                      <label>{field.replace(/([A-Z])/g, " $1")}</label>
                      <input
                        value={contact[field] || ""}
                        onChange={(e) => updateEmergencyContact(index, field, e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  ))}
                </div>
                {!readOnly && formData.emergencyContacts.length > 1 && (
                  <button className="link-button" type="button" onClick={() => removeEmergencyContact(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h3>Required Documents</h3>
              <p className="helper-text">Upload PDF or image files.</p>
            </div>
            <div className="form-grid">
              <DocumentUpload type="profile_picture" onUploaded={handleDocumentUploaded} disabled={readOnly} />
              <DocumentUpload type="drivers_license" onUploaded={handleDocumentUploaded} disabled={readOnly} />
              <DocumentUpload type="work_authorization" onUploaded={handleDocumentUploaded} disabled={readOnly} />
              {requiresOpt && (
                <DocumentUpload type="opt_receipt" onUploaded={handleDocumentUploaded} disabled={readOnly} />
              )}
            </div>
            <h4>Uploaded Documents</h4>
            <DocumentList documents={onboardingDocuments} />
          </div>

          {!readOnly && (
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Submitting..." : onboardingStatus === "never_submitted" ? "Submit" : "Resubmit"}
            </button>
          )}
        </form>
      </section>
    </div>
  );
};

export default OnboardingPage;
