import { Modal, List, Tag, Space, Button, Empty } from "antd";

const STEP_LABEL = {
  optReceipt: "OPT Receipt",
  optEAD: "OPT EAD",
  i983: "I-983",
  i20: "I-20",
};

export default function VisaDocumentsModal({
  open,
  onClose,
  visa,
  username,
}) {
  if (!visa) return null;

  const approvedDocs = Object.entries(STEP_LABEL)
    .map(([key, label]) => {
      const step = visa[key];
      if (step?.status === "approved" && step.fileUrl) {
        return {
          key,
          label,
          fileUrl: step.fileUrl,
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={`Approved Visa Documents — ${username}`}
    >
      {approvedDocs.length === 0 ? (
        <Empty description="No approved documents" />
      ) : (
        <List
          dataSource={approvedDocs}
          renderItem={(doc) => (
            <List.Item>
              <Space>
                <Tag color="success">{doc.label}</Tag>

                <Button
                  type="link"
                  href={doc.fileUrl}
                  target="_blank"
                >
                  Preview
                </Button>

                <Button
                  type="link"
                  href={doc.fileUrl}
                  download
                >
                  Download
                </Button>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}