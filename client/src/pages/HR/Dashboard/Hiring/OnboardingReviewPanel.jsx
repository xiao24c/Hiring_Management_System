// src/pages/HR/Dashboard/Hiring/OnboardingReviewPanel.jsx
import {
  Tabs,
  Table,
  Button,
  Space,
  Modal,
  Input,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Text } = Typography;

export default function OnboardingReviewPanel() {
  const [data, setData] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  const [loading, setLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hr/onboarding");
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.post(`/hr/onboarding/${id}/approve`);
    message.success("Onboarding approved");
    load();
  };

  const reject = async () => {
    await api.post(`/hr/onboarding/${rejectingId}/reject`, {
      feedback,
    });
    message.success("Onboarding rejected");
    setRejectingId(null);
    setFeedback("");
    load();
  };

  const columns = (status) => [
    {
      title: "Full Name",
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
          <Button
            type="link"
            onClick={() =>
              window.open(`/hr/onboarding/${r._id}`, "_blank")
            }
          >
            View Application
          </Button>

          {status === "pending" && (
            <>
              <Button type="primary" onClick={() => approve(r._id)}>
                Approve
              </Button>
              <Button danger onClick={() => setRejectingId(r._id)}>
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
      <Tabs defaultActiveKey="pending">
        <TabPane tab={`Pending (${data.pending.length})`} key="pending">
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns("pending")}
            dataSource={data.pending}
            scroll={{ x: true }}
          />
        </TabPane>

        <TabPane tab={`Rejected (${data.rejected.length})`} key="rejected">
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns("rejected")}
            dataSource={data.rejected}
            scroll={{ x: true }}
          />
        </TabPane>

        <TabPane tab={`Approved (${data.approved.length})`} key="approved">
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns("approved")}
            dataSource={data.approved}
            scroll={{ x: true }}
          />
        </TabPane>
      </Tabs>

      {/* Reject Modal */}
      <Modal
        open={!!rejectingId}
        title="Reject Onboarding Application"
        onOk={reject}
        onCancel={() => setRejectingId(null)}
      >
        <Text type="secondary">
          Feedback will be visible to the employee.
        </Text>
        <TextArea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{ marginTop: 12 }}
        />
      </Modal>
    </>
  );
}
