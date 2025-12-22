// src/components/Onboarding/OnboardingForm.jsx
import { useEffect } from "react";
import {
  Form,
  Button,
  message,
  Divider,
  Space,
  Alert,
} from "antd";
import dayjs from "dayjs";

import useOnboarding from "../../hooks/useOnboarding";

import BasicInfoSection from "./BasicInfoSection";
import ProfilePictureSection from "./ProfilePictureSection";
import DocumentUploadSection from "./DocumentUploadSection";
import AddressSection from "./AddressSection";
import ContactSection from "./ContactSection";
import LegalSection from "./LegalSection";
import WorkAuthorizationSection from "./WorkAuthorizationSection";
import ReferenceSection from "./ReferenceSection";
import EmergencyContactsSection from "./EmergencyContactsSection";
import FileSummarySection from "./FileSummarySection";

/**
 * mode:
 * - "not_submitted"
 * - "pending"
 * - "rejected"
 */
export default function OnboardingForm({ mode, initialData, userEmail }) {
  const [form] = Form.useForm();
  const {
    status,
    saveOnboardingDraft,
    submitOnboarding,
  } = useOnboarding();

  const isReadOnly = mode === "pending";
  const isRejected = mode === "rejected";
  const loading = status === "loading";

  /* =========================
     Prefill form from backend
  ========================== */
  useEffect(() => {
    if (!initialData) {
      form.setFieldsValue({ emergencyContacts: [{}] });
      return;
    }

    const {
      legalInfo,
      visaInfo,
      emergencyContacts,
      ...rest
    } = initialData;

    form.setFieldsValue({
      ...rest,
      legalInfo: {
        ...legalInfo,
        dateOfBirth: legalInfo?.dateOfBirth
          ? dayjs(legalInfo.dateOfBirth)
          : null,
      },
      visaInfo: {
        ...visaInfo,
        startDate: visaInfo?.startDate
          ? dayjs(visaInfo.startDate)
          : null,
        endDate: visaInfo?.endDate
          ? dayjs(visaInfo.endDate)
          : null,
      },
      emergencyContacts:
        emergencyContacts?.length > 0 ? emergencyContacts : [{}],
    });
  }, [initialData, form]);

  /* =========================
     Payload transform
  ========================== */
  const buildPayload = (values) => {
    const { legalInfo, visaInfo, ...rest } = values;

    return {
      ...rest,
      legalInfo: {
        ...legalInfo,
        dateOfBirth: legalInfo?.dateOfBirth
          ? legalInfo.dateOfBirth.toDate()
          : null,
      },
      visaInfo: {
        ...visaInfo,
        startDate: visaInfo?.startDate
          ? visaInfo.startDate.toDate()
          : null,
        endDate: visaInfo?.endDate
          ? visaInfo.endDate.toDate()
          : null,
      },
    };
  };

  /* =========================
     Actions
  ========================== */
  const handleSaveDraft = async () => {
    try {
      // Draft should allow partial data; use current form values without blocking on validation
      const values = form.getFieldsValue(true);
      await saveOnboardingDraft(buildPayload(values)).unwrap();
      message.success("Draft saved");
    } catch (err) {
      const msg =
        err?.data?.msg ||
        err?.message ||
        "Failed to save draft";
      message.error(msg);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await submitOnboarding(buildPayload(values)).unwrap();
      message.success(
        isRejected
          ? "Onboarding resubmitted successfully"
          : "Onboarding submitted successfully"
      );
    } catch (err) {
      message.error("Submit failed");
    }
  };

  /* =========================
     Render
  ========================== */
  return (
    <>
      {isReadOnly && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message="Your onboarding application is under HR review."
        />
      )}

      {isRejected && initialData?.feedback && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          message="HR Feedback"
          description={initialData.feedback}
        />
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        disabled={isReadOnly}
        autoComplete="off"
      >
        <BasicInfoSection readOnly={isReadOnly} />
        <Divider />

        <ProfilePictureSection readOnly={isReadOnly} />
        <Divider />

        <DocumentUploadSection readOnly={isReadOnly} />
        <Divider />

        <AddressSection readOnly={isReadOnly} />
        <Divider />

        <ContactSection
          userEmail={userEmail}
          readOnly={isReadOnly}
        />
        <Divider />

        <LegalSection readOnly={isReadOnly} />
        <Divider />

        <WorkAuthorizationSection readOnly={isReadOnly} />
        <Divider />

        <ReferenceSection readOnly={isReadOnly} />
        <Divider />

        <EmergencyContactsSection readOnly={isReadOnly} />

        {!isReadOnly && (
          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button onClick={handleSaveDraft} loading={loading}>
                Save Draft
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {isRejected ? "Resubmit Onboarding" : "Submit Onboarding"}
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>

      <Divider />
      <FileSummarySection onboardingData={initialData} />
    </>
  );
}
