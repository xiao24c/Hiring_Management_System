import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocumentList from "../../components/DocumentList.jsx";
import api from "../../services/api.js";
import { formatDate, formatPhone } from "../../utils/format.js";

const Section = ({ title, children }) => (
  <article className="section-card">
    <h3>{title}</h3>
    {children}
  </article>
);

const renderAddress = (address = {}) =>
  [address.building, address.street, address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ") || "--";

const EmployeeProfileView = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get(`/hr/employees/${id}`);
        setRecord(data.employee);
      } catch (error) {
        console.error("Failed to fetch employee", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="page-card">
        <p>Loading employee...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="page-card">
        <p>Employee not found.</p>
      </div>
    );
  }

  const profile = record.formData || {};
  const personalInfo = profile.personalInfo || {};
  const employment = profile.employment || {};
  const address = profile.address || {};
  const contact = profile.contactInfo || {};
  const reference = profile.reference;
  const emergencyContacts = profile.emergencyContacts || [];
  const documents = record.documents || [];
  const userMeta = record.user || {};

  return (
    <section className="page-card">
      <h1 className="page-title">
        {personalInfo.firstName ? `${personalInfo.firstName} ${personalInfo.lastName}` : userMeta.username}
      </h1>
      <Section title="Personal Info">
        <div className="form-grid">
          <div>
            <strong>Email</strong>
            <p>{personalInfo.email || userMeta.email}</p>
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
      </Section>
      <Section title="Address">
        <p>{renderAddress(address)}</p>
      </Section>
      <Section title="Contact">
        <p>Cell: {formatPhone(contact.cellPhone)}</p>
        <p>Work: {formatPhone(contact.workPhone)}</p>
      </Section>
      <Section title="Employment">
        <div className="form-grid">
          <div>
            <strong>Work Authorization</strong>
            <p>{employment.workAuthorization || "--"}</p>
          </div>
          <div>
            <strong>Visa Title</strong>
            <p>{employment.visaTitle || "--"}</p>
          </div>
          <div>
            <strong>Start</strong>
            <p>{formatDate(employment.startDate)}</p>
          </div>
          <div>
            <strong>End</strong>
            <p>{formatDate(employment.endDate)}</p>
          </div>
        </div>
      </Section>
      {reference && (
        <Section title="Reference">
          <p>
            {reference.firstName} {reference.lastName}
          </p>
          <p>Phone: {formatPhone(reference.phone)}</p>
          <p>Email: {reference.email}</p>
          <p>Relationship: {reference.relationship}</p>
        </Section>
      )}
      {emergencyContacts.length > 0 && (
        <Section title="Emergency Contacts">
          {emergencyContacts.map((contact, idx) => (
            <div key={idx} style={{ marginBottom: "0.75rem" }}>
              <strong>
                {contact.firstName} {contact.lastName}
              </strong>
              <p>Relationship: {contact.relationship}</p>
              <p>Phone: {formatPhone(contact.phone)}</p>
              <p>Email: {contact.email}</p>
            </div>
          ))}
        </Section>
      )}
      <Section title="Documents">
        <DocumentList documents={documents} />
      </Section>
    </section>
  );
};

export default EmployeeProfileView;
