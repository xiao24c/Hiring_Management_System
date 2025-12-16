import { Card, Tag, Input, Button, Space, Alert } from "antd";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { submitVisaStep } from "../../../../store/visaSlice";

const STATUS_COLOR = {
  not_submitted: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

export default function VisaStepCard({
  title,
  stepKey,
  step,
  isActive,
}) {
  const dispatch = useDispatch();

  // ✅ 只在首次 render 用 step.fileUrl
  const [fileUrl, setFileUrl] = useState(step?.fileUrl || "");

  const status = step?.status || "not_submitted";

  const canSubmit =
    isActive && (status === "not_submitted" || status === "rejected");

  const handleSubmit = () => {
    dispatch(
      submitVisaStep({
        stepKey,
        status,
        fileUrl,
      })
    );
  };

  return (
    <Card
      type="inner"
      style={{ marginBottom: 16 }}
      title={
        <Space>
          {title}
          <Tag color={STATUS_COLOR[status]}>
            {status.replace("_", " ").toUpperCase()}
          </Tag>
          {!isActive && <Tag>LOCKED</Tag>}
        </Space>
      }
    >
      {status === "rejected" && step?.feedback && (
        <Alert
          type="error"
          message="HR Feedback"
          description={step.feedback}
          style={{ marginBottom: 12 }}
        />
      )}

      <Input
        placeholder="Document URL"
        value={fileUrl}
        disabled={!canSubmit}
        onChange={(e) => setFileUrl(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {canSubmit && (
        <Button type="primary" onClick={handleSubmit}>
          {status === "rejected" ? "Resubmit" : "Submit"}
        </Button>
      )}

      {status === "pending" && (
        <Alert
          type="info"
          message="Waiting for HR review"
          style={{ marginTop: 12 }}
        />
      )}

      {status === "approved" && (
        <Alert
          type="success"
          message="Approved"
          style={{ marginTop: 12 }}
        />
      )}
    </Card>
  );
}