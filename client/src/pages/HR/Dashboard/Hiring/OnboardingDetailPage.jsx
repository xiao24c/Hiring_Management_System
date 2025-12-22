import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Divider,
  Form,
  Tag,
  Space,
  Button,
  Input,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../../../../api/axiosInstance";

import BasicInfoSection from "../../../../components/Onboarding/BasicInfoSection";
import ProfilePictureSection from "../../../../components/Onboarding/ProfilePictureSection";
import AddressSection from "../../../../components/Onboarding/AddressSection";
import ContactSection from "../../../../components/Onboarding/ContactSection";
import LegalSection from "../../../../components/Onboarding/LegalSection";
import WorkAuthorizationSection from "../../../../components/Onboarding/WorkAuthorizationSection";
import ReferenceSection from "../../../../components/Onboarding/ReferenceSection";
import EmergencyContactsSection from "../../../../components/Onboarding/EmergencyContactsSection";
import FileSummarySection from "../../../../components/Onboarding/FileSummarySection";

const STATUS_COLOR = {
  not_submitted: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

export default function OnboardingDetailPage() {
  const { onboardingId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [record, setRecord] = useState(null);
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/onboarding/${onboardingId}`);
      setRecord(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [onboardingId]);

  useEffect(() => {
    if (!record) return;
    const { legalInfo, visaInfo, ...rest } = record;

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
        startDate: visaInfo?.startDate ? dayjs(visaInfo.startDate) : null,
        endDate: visaInfo?.endDate ? dayjs(visaInfo.endDate) : null,
      },
    });
  }, [record, form]);

  const handleApprove = async () => {
    await api.post(`/hr/onboarding/${onboardingId}/approve`);
    message.success("Onboarding approved");
    load();
  };

  const handleReject = async () => {
    await api.post(`/hr/onboarding/${onboardingId}/reject`, { feedback });
    message.success("Onboarding rejected");
    setFeedback("");
    load();
  };

  if (loading) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <Card style={{ maxWidth: 900, margin: "40px auto" }}>
        <Alert type="error" message={error || "Not found"} />
      </Card>
    );
  }

  const status = record.status || "not_submitted";
  const userEmail = record.userId?.email || "";

  return (
    <Card
      title={`Onboarding Application — ${record.name?.firstName || ""} ${record.name?.lastName || ""}`}
      style={{ maxWidth: 1000, margin: "24px auto" }}
      extra={
        <Button
          onClick={() =>
            navigate("/hr/hiring", {
              state: {
                activeTab: "onboarding",
                onboardingStatusTab: record.status || "pending",
              },
            })
          }
        >
          Back to Hiring
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <span>Status:</span>
        <Tag color={STATUS_COLOR[status]}>{status.toUpperCase()}</Tag>
      </Space>

      {status === "rejected" && record.feedback && (
        <Alert
          type="error"
          message="Previous Feedback"
          description={record.feedback}
          style={{ marginBottom: 16 }}
        />
      )}

      {status === "pending" && (
        <>
          <Input.TextArea
            rows={3}
            placeholder="Rejection feedback (visible to employee)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={handleApprove}>
              Approve
            </Button>
            <Button danger onClick={handleReject}>
              Reject
            </Button>
          </Space>
        </>
      )}

      <Form layout="vertical" form={form} disabled>
        <BasicInfoSection readOnly />
        <Divider />

        <ProfilePictureSection readOnly />
        <Divider />

        <AddressSection readOnly />
        <Divider />

        <ContactSection readOnly userEmail={userEmail} />
        <Divider />

        <LegalSection readOnly />
        <Divider />

        <WorkAuthorizationSection readOnly />
        <Divider />

        <ReferenceSection readOnly />
        <Divider />

        <EmergencyContactsSection readOnly />

        <Divider />
        <FileSummarySection onboardingData={record} />
      </Form>
    </Card>
  );
}
