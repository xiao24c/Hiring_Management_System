// src/pages/Employee/Dashboard/PersonalInfoPage.jsx
import { Card, Spin, Form, Button, Space, Modal, message, Input } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import useOnboarding from "../../../hooks/useOnboarding";

import BasicInfoSection from "../../../components/Onboarding/BasicInfoSection";
import ProfilePictureSection from "../../../components/Onboarding/ProfilePictureSection";
import AddressSection from "../../../components/Onboarding/AddressSection";
import ContactSection from "../../../components/Onboarding/ContactSection";
import LegalSection from "../../../components/Onboarding/LegalSection";
import WorkAuthorizationSection from "../../../components/Onboarding/WorkAuthorizationSection";
import EmergencyContactsSection from "../../../components/Onboarding/EmergencyContactsSection";
import PersonalDocumentsSection from "../../../components/Onboarding/PersonalDocumentsSection";

export default function PersonalInfoPage() {
  const { data: onboarding, status, loadOnboarding, saveOnboardingDraft } =
    useOnboarding();
  const [form] = Form.useForm();
  const { user } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState({
    name: false,
    address: false,
    contact: false,
    employment: false,
    emergency: false,
    documents: false,
  });
  const [savingSection, setSavingSection] = useState(null);
  const initialValuesRef = useRef(null);

  const isEditing = useMemo(
    () => Object.values(editing).some(Boolean),
    [editing]
  );

  const normalizeOnboarding = (data) => {
    if (!data) return {};
    const { legalInfo, visaInfo, ...rest } = data;

    return {
      ...rest,
      legalInfo: {
        ...legalInfo,
        dateOfBirth: legalInfo?.dateOfBirth
          ? dayjs(legalInfo.dateOfBirth)
          : null,
      },
      visaInfo: {
        ...visaInfo,
        startDate: visaInfo?.startDate ? dayjs(visaInfo.startDate) : null,
        endDate: visaInfo?.endDate ? dayjs(visaInfo.endDate) : null,
      },
    };
  };

  useEffect(() => {
    loadOnboarding();
  }, []);

  useEffect(() => {
    if (!onboarding) return;
    const normalized = normalizeOnboarding(onboarding);
    initialValuesRef.current = normalized;
    if (!isEditing) {
      form.setFieldsValue(normalized);
    }
  }, [onboarding, form, isEditing]);

  if (!onboarding || status === "loading") {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const startEdit = (key) => {
    if (isEditing) return;
    setEditing({
      name: false,
      address: false,
      contact: false,
      employment: false,
      emergency: false,
      documents: false,
      [key]: true,
    });
  };

  const resetSection = (key) => {
    const base = initialValuesRef.current || {};

    switch (key) {
      case "name":
        form.setFieldsValue({
          name: base.name,
          profilePictureUrl: base.profilePictureUrl,
          legalInfo: base.legalInfo,
        });
        break;
      case "address":
        form.setFieldsValue({ address: base.address });
        break;
      case "contact":
        form.setFieldsValue({ contactInfo: base.contactInfo });
        break;
      case "employment":
        form.setFieldsValue({ visaInfo: base.visaInfo });
        break;
      case "emergency":
        form.setFieldsValue({ emergencyContacts: base.emergencyContacts });
        break;
      case "documents":
        form.setFieldsValue({
          driverLicenseUrl: base.driverLicenseUrl,
          visaInfo: base.visaInfo,
        });
        break;
      default:
        break;
    }
  };

  const cancelEdit = (key) => {
    Modal.confirm({
      title: "Discard changes?",
      content: "Your changes will be lost.",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        resetSection(key);
        setEditing((prev) => ({ ...prev, [key]: false }));
      },
    });
  };

  const buildPayload = (payload) => {
    const next = { ...payload };
    if (next.legalInfo?.dateOfBirth?.toDate) {
      next.legalInfo = {
        ...next.legalInfo,
        dateOfBirth: next.legalInfo.dateOfBirth.toDate(),
      };
    }
    if (next.visaInfo?.startDate?.toDate) {
      next.visaInfo = {
        ...next.visaInfo,
        startDate: next.visaInfo.startDate.toDate(),
      };
    }
    if (next.visaInfo?.endDate?.toDate) {
      next.visaInfo = {
        ...next.visaInfo,
        endDate: next.visaInfo.endDate.toDate(),
      };
    }
    return next;
  };

  const saveSection = async (key, fieldPaths) => {
    setSavingSection(key);
    try {
      await form.validateFields(fieldPaths);
      const values = form.getFieldsValue(true);

      let payload = {};
      switch (key) {
        case "name":
          payload = {
            name: values.name,
            profilePictureUrl: values.profilePictureUrl,
            legalInfo: values.legalInfo,
          };
          break;
        case "address":
          payload = { address: values.address };
          break;
        case "contact":
          payload = { contactInfo: values.contactInfo };
          break;
        case "employment":
          payload = { visaInfo: values.visaInfo };
          break;
        case "emergency":
          payload = { emergencyContacts: values.emergencyContacts };
          break;
        case "documents":
          payload = {
            driverLicenseUrl: values.driverLicenseUrl,
            visaInfo: values.visaInfo,
          };
          break;
        default:
          break;
      }

      await saveOnboardingDraft(buildPayload(payload)).unwrap();
      message.success("Saved");
      setEditing((prev) => ({ ...prev, [key]: false }));
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || "Save failed");
    } finally {
      setSavingSection(null);
    }
  };

  const email = user?.email || "";

  return (
    <Card
      title="Personal Information"
      style={{ maxWidth: 1000, margin: "0 auto" }}
    >
      <Form layout="vertical" form={form}>
        {/* ================= Name ================= */}
        <Space style={{ marginBottom: 12 }}>
          <Button
            onClick={() => startEdit("name")}
            disabled={isEditing || editing.name}
          >
            Edit
          </Button>
          {editing.name && (
            <>
              <Button
                type="primary"
                loading={savingSection === "name"}
                onClick={() =>
                  saveSection("name", [
                    ["name", "firstName"],
                    ["name", "lastName"],
                    ["legalInfo", "ssn"],
                    ["legalInfo", "dateOfBirth"],
                    ["legalInfo", "gender"],
                  ])
                }
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("name")}>Cancel</Button>
            </>
          )}
        </Space>
        <BasicInfoSection readOnly={!editing.name} />
        <ProfilePictureSection readOnly={!editing.name} />
        <Form.Item label="Email">
          <Input value={email} disabled />
        </Form.Item>
        <LegalSection readOnly={!editing.name} />

        {/* ================= Address ================= */}
        <Space style={{ margin: "16px 0 12px" }}>
          <Button
            onClick={() => startEdit("address")}
            disabled={isEditing || editing.address}
          >
            Edit
          </Button>
          {editing.address && (
            <>
              <Button
                type="primary"
                loading={savingSection === "address"}
                onClick={() =>
                  saveSection("address", [
                    ["address", "street"],
                    ["address", "city"],
                    ["address", "state"],
                    ["address", "zip"],
                  ])
                }
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("address")}>Cancel</Button>
            </>
          )}
        </Space>
        <AddressSection readOnly={!editing.address} />

        {/* ================= Contact ================= */}
        <Space style={{ margin: "16px 0 12px" }}>
          <Button
            onClick={() => startEdit("contact")}
            disabled={isEditing || editing.contact}
          >
            Edit
          </Button>
          {editing.contact && (
            <>
              <Button
                type="primary"
                loading={savingSection === "contact"}
                onClick={() =>
                  saveSection("contact", [
                    ["contactInfo", "cellPhone"],
                    ["contactInfo", "workPhone"],
                  ])
                }
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("contact")}>Cancel</Button>
            </>
          )}
        </Space>
        <ContactSection
          readOnly={!editing.contact}
          showEmail={false}
        />

        {/* ================= Employment ================= */}
        <Space style={{ margin: "16px 0 12px" }}>
          <Button
            onClick={() => startEdit("employment")}
            disabled={isEditing || editing.employment}
          >
            Edit
          </Button>
          {editing.employment && (
            <>
              <Button
                type="primary"
                loading={savingSection === "employment"}
                onClick={() =>
                  saveSection("employment", [
                    ["visaInfo", "isCitizenOrPR"],
                    ["visaInfo", "status"],
                    ["visaInfo", "workAuthorization"],
                    ["visaInfo", "startDate"],
                    ["visaInfo", "endDate"],
                    ["visaInfo", "otherTitle"],
                  ])
                }
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("employment")}>Cancel</Button>
            </>
          )}
        </Space>
        <WorkAuthorizationSection
          readOnly={!editing.employment}
          showOptReceipt={false}
        />

        {/* ================= Emergency Contacts ================= */}
        <Space style={{ margin: "16px 0 12px" }}>
          <Button
            onClick={() => startEdit("emergency")}
            disabled={isEditing || editing.emergency}
          >
            Edit
          </Button>
          {editing.emergency && (
            <>
              <Button
                type="primary"
                loading={savingSection === "emergency"}
                onClick={() => saveSection("emergency", [["emergencyContacts"]])}
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("emergency")}>Cancel</Button>
            </>
          )}
        </Space>
        <EmergencyContactsSection readOnly={!editing.emergency} />

        {/* ================= Documents ================= */}
        <Space style={{ margin: "16px 0 12px" }}>
          <Button
            onClick={() => startEdit("documents")}
            disabled={isEditing || editing.documents}
          >
            Edit
          </Button>
          {editing.documents && (
            <>
              <Button
                type="primary"
                loading={savingSection === "documents"}
                onClick={() =>
                  saveSection("documents", [
                    ["driverLicenseUrl"],
                    ["visaInfo", "optReceiptUrl"],
                  ])
                }
              >
                Save
              </Button>
              <Button onClick={() => cancelEdit("documents")}>Cancel</Button>
            </>
          )}
        </Space>
        <PersonalDocumentsSection readOnly={!editing.documents} />
      </Form>
    </Card>
  );
}
