import { useEffect, useMemo, useState } from "react";
import DocumentList from "../components/DocumentList.jsx";
import DocumentUpload from "../components/DocumentUpload.jsx";
import { useAuth } from "../hooks/useAuth.js";
import api from "../services/api.js";
import { formatDate, formatPhone } from "../utils/format.js";
import { workAuthorizationOptions } from "../utils/constants.js";

const cloneProfile = (profile) => JSON.parse(JSON.stringify(profile || {}));
const placeholderAvatar =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='48' fill='%23e2e8f0'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%2394a3b8'>👤</text></svg>";

const PersonalInfoPage = () => {
  const { employeeProfile, refreshEmployeeProfile } = useAuth();
  const profile = employeeProfile?.profile;
  const [draft, setDraft] = useState(cloneProfile(profile));
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(cloneProfile(profile));
    setEditing(null);
  }, [profile]);

  const documents = useMemo(() => employeeProfile?.documents || [], [employeeProfile]);

  if (!profile) {
    return (
      <div className="page-card">
        <h1 className="page-title">Personal Information</h1>
        <p>You will be able to view this page once HR approves your onboarding application.</p>
      </div>
    );
  }

  const handleChange = (section, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]:
        section === "emergencyContacts"
          ? value
          : {
              ...prev[section],
              [field]: value
            }
    }));
  };

  const handleContactChange = (index, field, value) => {
    setDraft((prev) => {
      const contacts = prev.emergencyContacts?.length ? [...prev.emergencyContacts] : [{ firstName: "", lastName: "", middleName: "", phone: "", email: "", relationship: "" }];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
  };

  const cancelEdit = () => {
    if (window.confirm("Discard your changes?")) {
      setDraft(cloneProfile(profile));
      setEditing(null);
      setError(null);
    }
  };

  const saveSection = async (section) => {
    setSaving(true);
    setError(null);
    try {
      const payload = { [section]: draft[section] };
      await api.put("/employee/profile", payload);
      await refreshEmployeeProfile();
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const renderActions = (section) => (
    <div>
      {editing === section ? (
        <>
          <button className="primary-button" onClick={() => saveSection(section)} disabled={saving}>
            Save
          </button>
          <button className="link-button" type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </>
      ) : (
        <button className="link-button" type="button" onClick={() => setEditing(section)}>
          Edit
        </button>
      )}
    </div>
  );

  const personalInfo = draft.personalInfo || {};
  const address = draft.address || {};
  const contactInfo = draft.contactInfo || {};
  const employment = draft.employment || {};
  const emergencyContacts = draft.emergencyContacts?.length
    ? draft.emergencyContacts
    : [{ firstName: "", lastName: "", middleName: "", phone: "", email: "", relationship: "" }];

  return (
    <div>
      <section className="page-card">
        <h1 className="page-title">Personal Information</h1>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        <article className="section-card">
          <div className="section-card__header">
            <h3>Name & Identity</h3>
            {renderActions("personalInfo")}
          </div>
          <div className="profile-header" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <img
              src={personalInfo.profilePicture || placeholderAvatar}
              alt="Profile"
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", background: "#e2e8f0" }}
            />
            <div>
              <h2>
                {[personalInfo.firstName, personalInfo.middleName, personalInfo.lastName].filter(Boolean).join(" ") ||
                  "Name not provided"}
              </h2>
              <p className="helper-text">Preferred: {personalInfo.preferredName || "--"}</p>
            </div>
          </div>
          {editing === "personalInfo" ? (
            <div className="form-grid" style={{ marginTop: "1rem" }}>
              {[
                ["First Name", "firstName"],
                ["Middle Name", "middleName"],
                ["Last Name", "lastName"],
                ["Preferred Name", "preferredName"],
                ["Email", "email", true],
                ["SSN", "ssn"],
                ["Date of Birth", "dateOfBirth", false, "date"],
                ["Gender", "gender"]
              ].map(([label, key, readOnly, type]) => (
                <div className="input-group" key={key}>
                  <label>{label}</label>
                  <input
                    type={type || "text"}
                    value={personalInfo[key] || ""}
                    readOnly={readOnly}
                    onChange={(e) => handleChange("personalInfo", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="form-grid" style={{ marginTop: "1rem" }}>
              <div>
                <strong>Email</strong>
                <p>{personalInfo.email}</p>
              </div>
              <div>
                <strong>SSN</strong>
                <p>{personalInfo.ssn || "--"}</p>
              </div>
              <div>
                <strong>Date of Birth</strong>
                <p>{formatDate(personalInfo.dateOfBirth)}</p>
              </div>
              <div>
                <strong>Gender</strong>
                <p>{personalInfo.gender || "--"}</p>
              </div>
            </div>
          )}
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <h3>Address</h3>
            {renderActions("address")}
          </div>
          {editing === "address" ? (
            <div className="form-grid">
              {[
                ["Building", "building"],
                ["Street", "street"],
                ["City", "city"],
                ["State", "state"],
                ["Zip", "zip"]
              ].map(([label, key]) => (
                <div className="input-group" key={key}>
                  <label>{label}</label>
                  <input value={address[key] || ""} onChange={(e) => handleChange("address", key, e.target.value)} />
                </div>
              ))}
            </div>
          ) : (
            <p>
              {[address.building, address.street, address.city, address.state, address.zip]
                .filter(Boolean)
                .join(", ") || "Not provided"}
            </p>
          )}
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <h3>Contact Info</h3>
            {renderActions("contactInfo")}
          </div>
          {editing === "contactInfo" ? (
            <div className="form-grid">
              {[
                ["Cell Phone", "cellPhone"],
                ["Work Phone", "workPhone"]
              ].map(([label, key]) => (
                <div className="input-group" key={key}>
                  <label>{label}</label>
                  <input value={contactInfo[key] || ""} onChange={(e) => handleChange("contactInfo", key, e.target.value)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="form-grid">
              <div>
                <strong>Cell</strong>
                <p>{formatPhone(contactInfo.cellPhone)}</p>
              </div>
              <div>
                <strong>Work</strong>
                <p>{formatPhone(contactInfo.workPhone)}</p>
              </div>
            </div>
          )}
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <h3>Employment</h3>
            {renderActions("employment")}
          </div>
          {editing === "employment" ? (
            <div className="form-grid">
              {[
                ["Visa Title", "visaTitle"],
                ["Work Authorization", "workAuthorization"],
                ["Other Authorization", "workAuthorizationOther"],
                ["Start Date", "startDate", "date"],
                ["End Date", "endDate", "date"]
              ].map(([label, key, type]) => (
                <div className="input-group" key={key}>
                  <label>{label}</label>
                  <input
                    type={type || "text"}
                    value={employment[key] ? (type === "date" ? employment[key].slice(0, 10) : employment[key]) : ""}
                    onChange={(e) => handleChange("employment", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="form-grid">
              <div>
                <strong>Visa Title</strong>
                <p>{employment.visaTitle || "--"}</p>
              </div>
              <div>
                <strong>Work Authorization</strong>
                <p>
                  {workAuthorizationOptions.find((option) => option.value === employment.workAuthorization)?.label ||
                    employment.workAuthorization ||
                    "--"}
                </p>
              </div>
              <div>
                <strong>Start Date</strong>
                <p>{formatDate(employment.startDate)}</p>
              </div>
              <div>
                <strong>End Date</strong>
                <p>{formatDate(employment.endDate)}</p>
              </div>
            </div>
          )}
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <h3>Emergency Contacts</h3>
            {renderActions("emergencyContacts")}
          </div>
          {editing === "emergencyContacts" ? (
            emergencyContacts.map((contact, index) => (
              <div key={index} className="section-card" style={{ background: "#f8fafc", marginBottom: "1rem" }}>
                <div className="form-grid">
                  {Object.keys(contact).map((field) => (
                    <div className="input-group" key={field}>
                      <label>{field.replace(/([A-Z])/g, " $1")}</label>
                      <input
                        value={contact[field] || ""}
                        onChange={(e) => handleContactChange(index, field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            emergencyContacts.map((contact, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <strong>
                  {contact.firstName} {contact.lastName}
                </strong>
                <p>Relationship: {contact.relationship || "--"}</p>
                <p>Phone: {formatPhone(contact.phone)}</p>
                <p>Email: {contact.email || "--"}</p>
              </div>
            ))
          )}
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <h3>Documents</h3>
          </div>
          <p className="helper-text">Download or preview your submitted documents. Upload a new profile picture if needed.</p>
          <DocumentUpload type="profile_picture" onUploaded={refreshEmployeeProfile} />
          <DocumentList documents={documents.filter((doc) => doc.category !== "visa")} />
        </article>
      </section>
    </div>
  );
};

export default PersonalInfoPage;
