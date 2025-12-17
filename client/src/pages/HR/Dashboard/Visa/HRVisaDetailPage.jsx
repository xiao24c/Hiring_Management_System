import { Card, Spin, Alert, Button, Space, Input, Typography, Tag, Modal } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_LABEL = {
  optReceipt: "OPT Receipt",
  optEAD: "OPT EAD",
  i983: "I-983",
  i20: "I-20",
};

const STATUS_COLOR = {
  not_submitted: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

export default function HRVisaDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/visa/${userId}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data || !data.visa) {
    return (
      <Card style={{ maxWidth: 800, margin: "40px auto" }}>
        <Alert
          type="info"
          message="This employee does not have an F-1 visa workflow."
        />
      </Card>
    );
  }

  const {
    user,
    visa,
    activeStep,
    activeStepStatus,
    allowedActions,
    activeStepFile,
  } = data;

  const handleAction = async (action) => {
    await api.post(`/hr/visa/${userId}/action`, {
      action,
      feedback,
    });
    setFeedback("");
    load();
  };

  return (
    <Card style={{ maxWidth: 900, margin: "24px auto" }}>
      <Title level={3}>
        Visa Management — {user?.username}
      </Title>

      <Space style={{ marginBottom: 16 }}>
        <Text strong>Current Step:</Text>
        <Tag>{STEP_LABEL[activeStep]}</Tag>
        <Tag color={STATUS_COLOR[activeStepStatus]}>
          {activeStepStatus.toUpperCase()}
        </Tag>
      </Space>

      {/* ---------- Document Preview ---------- */}
      {allowedActions.includes("preview") && activeStepFile && (
        <>
          <Button onClick={() => setPreviewOpen(true)}>
            Preview Document
          </Button>
          <Button type="link" href={activeStepFile} download>
            Download
          </Button>

          <Modal
            open={previewOpen}
            title="Document Preview"
            footer={null}
            width={900}
            onCancel={() => setPreviewOpen(false)}
          >
            <iframe
              src={activeStepFile}
              style={{ width: "100%", height: "600px", border: "none" }}
              title="Visa Document"
            />
          </Modal>
        </>
      )}

      {/* ---------- Reject Feedback ---------- */}
      {allowedActions.includes("reject") && (
        <TextArea
          rows={4}
          placeholder="Rejection feedback (visible to employee)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{ marginTop: 16 }}
        />
      )}

      {/* ---------- Actions ---------- */}
      <Space style={{ marginTop: 16 }}>
        {allowedActions.includes("approve") && (
          <Button type="primary" onClick={() => handleAction("approve")}>
            Approve
          </Button>
        )}

        {allowedActions.includes("reject") && (
          <Button danger onClick={() => handleAction("reject")}>
            Reject
          </Button>
        )}

        {allowedActions.includes("notify_user") && (
          <Button onClick={() => handleAction("notify_user")}>
            Send Notification
          </Button>
        )}

        <Button onClick={() => navigate(-1)}>Back</Button>
      </Space>
    </Card>
  );
}
