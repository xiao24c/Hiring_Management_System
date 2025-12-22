import { Card, Tag, Button, Space, Alert, Typography, message } from "antd";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { submitVisaStep, fetchVisaStatus } from "../../../../store/visaSlice";
import FileUploadField from "../../../../components/shared/FileUploadField";

const { Link, Text } = Typography;

const STATUS_COLOR = {
  not_submitted: "default",
  pending: "processing",
  approved: "success",
  rejected: "error",
};

const TEMPLATE_BASE =
  import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5050/uploads";

const PENDING_MESSAGE = {
  optReceipt: "Waiting for HR to approve your OPT Receipt",
  optEAD: "Waiting for HR to approve your OPT EAD",
  i983: "Waiting for HR to approve and sign your I-983",
  i20: "Waiting for HR to approve your I-20",
};

const APPROVED_MESSAGE = {
  optReceipt: "Please upload a copy of your OPT EAD.",
  optEAD: "Please download and fill out the I-983 form.",
  i983:
    "Please send the I-983 along all necessary documents to your school and upload the new I-20.",
  i20: "All documents have been approved.",
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
    isActive &&
    (status === "rejected" ||
      (status === "not_submitted" &&
        (stepKey !== "optReceipt" || !step?.fileUrl)));
  const missingFile = !fileUrl;

  const handleSubmit = () => {
    if (missingFile) {
      message.warning("Please upload a file before submitting.");
      return;
    }

    dispatch(
      submitVisaStep({
        stepKey,
        status,
        fileUrl,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchVisaStatus());
        message.success(
          status === "rejected" ? "Resubmitted" : "Submitted"
        );
      })
      .catch((err) => {
        message.error(err || "Submit failed");
      });
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
      {stepKey === "i983" && (
        <Space direction="vertical" style={{ marginBottom: 12 }}>
          <Text strong>I-983 Templates</Text>
          <Space>
            <Link
              href={`${TEMPLATE_BASE}/i983_empty.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              Empty Template
            </Link>
            <Link
              href={`${TEMPLATE_BASE}/i983_sample.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              Sample Template
            </Link>
          </Space>
        </Space>
      )}

      {status === "rejected" && step?.feedback && (
        <Alert
          type="error"
          message="HR Feedback"
          description={step.feedback}
          style={{ marginBottom: 12 }}
        />
      )}

      {canSubmit && missingFile && (
        <Alert
          type="warning"
          message="File required"
          description="Please upload a document before submitting."
          style={{ marginBottom: 12 }}
        />
      )}

      <div style={{ marginBottom: 12 }}>
        <FileUploadField
          value={fileUrl}
          onChange={setFileUrl}
          disabled={!canSubmit}
          accept=".pdf,image/*"
          buttonText="Upload document"
        />
      </div>

      {canSubmit && (
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={missingFile}
        >
          {status === "rejected" ? "Resubmit" : "Submit"}
        </Button>
      )}

      {status === "pending" && (
        <Alert
          type="info"
          message={PENDING_MESSAGE[stepKey] || "Waiting for HR review"}
          style={{ marginTop: 12 }}
        />
      )}

      {status === "approved" && (
        <Alert
          type="success"
          message={APPROVED_MESSAGE[stepKey] || "Approved"}
          style={{ marginTop: 12 }}
        />
      )}

      {!PENDING_MESSAGE[stepKey] && status === "pending" && (
        <Alert type="info" message="Waiting for HR review" />
      )}

      {!APPROVED_MESSAGE[stepKey] && status === "approved" && (
        <Alert type="success" message="Approved" />
      )}
    </Card>
  );
}
