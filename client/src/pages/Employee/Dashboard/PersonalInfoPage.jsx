// src/pages/Employee/Dashboard/PersonalInfoPage.jsx
import { Card, Spin, Form } from "antd";
import useOnboarding from "../../../hooks/useOnboarding";

import BasicInfoSection from "../../../components/Onboarding/BasicInfoSection";
import ProfilePictureSection from "../../../components/Onboarding/ProfilePictureSection";
import AddressSection from "../../../components/Onboarding/AddressSection";
import ContactSection from "../../../components/Onboarding/ContactSection";
import LegalSection from "../../../components/Onboarding/LegalSection";
import WorkAuthorizationSection from "../../../components/Onboarding/WorkAuthorizationSection";
import ReferenceSection from "../../../components/Onboarding/ReferenceSection";
import EmergencyContactsSection from "../../../components/Onboarding/EmergencyContactsSection";
import FileSummarySection from "../../../components/Onboarding/FileSummarySection";

export default function PersonalInfoPage() {
  const { data: onboarding, status } = useOnboarding();
  const [form] = Form.useForm();

  if (!onboarding || status === "loading") {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title="Personal Information"
      style={{ maxWidth: 1000, margin: "0 auto" }}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={onboarding}
        disabled
      >
        <BasicInfoSection readOnly />
        <ProfilePictureSection readOnly />
        <AddressSection readOnly />
        <ContactSection readOnly />
        <LegalSection readOnly />
        <WorkAuthorizationSection readOnly />
        <ReferenceSection readOnly />
        <EmergencyContactsSection readOnly />

        <FileSummarySection onboardingData={onboarding} />
      </Form>
    </Card>
  );
}