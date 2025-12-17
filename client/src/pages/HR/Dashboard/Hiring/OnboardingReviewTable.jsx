import { Table, Button, Space, Modal, Input } from "antd";
import { useState } from "react";
import api from "../../../../api/axiosInstance";

export default function OnboardingReviewTable({ data, mode, onRefresh }) {
  const [feedback, setFeedback] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const handleApprove = async (id) => {
    await api.post(`/hr/onboarding/${id}/approve`);
    onRefresh?.();
  };

  const handleReject = async () => {
    await api.post(`/hr/onboarding/${rejectingId}/reject`, { feedback });
    setFeedback("");
    setRejectingId(null);
    onRefresh?.();
  };

  const columns = [
    {
      title: "Name",
      render: (_, r) =>
        `${r.name?.firstName || ""} ${r.name?.lastName || ""}`,
    },
    {
      title: "Email",
      render: (_, r) => r.userId?.email,
    },
    {
      title: "Action",
      render: (_, r) => (
        <Space>
          <a href={`/hr/onboarding/${r._id}`} target="_blank" rel="noreferrer">
            View Application
          </a>

          {mode === "pending" && (
            <>
              <Button type="link" onClick={() => handleApprove(r._id)}>
                Approve
              </Button>
              <Button danger type="link" onClick={() => setRejectingId(r._id)}>
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        scroll={{ x: true }}
      />

      <Modal
        open={!!rejectingId}
        title="Reject Onboarding Application"
        onOk={handleReject}
        onCancel={() => setRejectingId(null)}
      >
        <Input.TextArea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback visible to employee"
        />
      </Modal>
    </>
  );
}
