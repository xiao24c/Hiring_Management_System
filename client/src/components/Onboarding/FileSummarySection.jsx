// src/components/Onboarding/FileSummarySection.jsx
import { Card, Descriptions } from "antd";

export default function FileSummarySection({ onboardingData }) {
  const profilePictureUrl = onboardingData?.profilePictureUrl || "";
  const optReceiptUrl = onboardingData?.visaInfo?.optReceiptUrl || "";
  const driverLicenseUrl = onboardingData?.driverLicenseUrl || "";

  const hasAny =
    profilePictureUrl || optReceiptUrl || driverLicenseUrl;

  if (!hasAny) return null;

  return (
    <Card size="small" style={{ marginTop: 24 }}>
      <h3>Summary of Uploaded Documents</h3>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Profile Picture">
          {profilePictureUrl || "Not uploaded"}
        </Descriptions.Item>
        <Descriptions.Item label="Driver's License">
          {driverLicenseUrl || "Not uploaded"}
        </Descriptions.Item>
        <Descriptions.Item label="Work Authorization Document">
          {optReceiptUrl || "Not uploaded"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}