import {
  Tabs,
  Table,
  Tag,
  Button,
  Input,
  Empty,
  Spin,
  Modal,
  message,
  Space,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";
import VisaDocumentsModal from "./VisaDocumentsModal";

const { TabPane } = Tabs;

/* =========================
   Const
========================= */

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

/* =========================
   Component
========================= */

export default function HRVisaListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // document modal
  const [docOpen, setDocOpen] = useState(false);
  const [docVisa, setDocVisa] = useState(null);
  const [docUser, setDocUser] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRecord, setReviewRecord] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     Load summary list
  ========================= */
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hr/visa");
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =========================
     Search (first/last/preferred + username + email)
  ========================= */
  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();

    return data.filter((r) => {
      const username = r.user?.username?.toLowerCase() || "";
      const email = r.user?.email?.toLowerCase() || "";
      const first = r.name?.firstName?.toLowerCase() || "";
      const last = r.name?.lastName?.toLowerCase() || "";
      const preferred = r.name?.preferredName?.toLowerCase() || "";
      return (
        username.includes(q) ||
        email.includes(q) ||
        first.includes(q) ||
        last.includes(q) ||
        preferred.includes(q)
      );
    });
  }, [data, query]);

  /* =========================
     In Progress (F1 only)
  ========================= */
  const inProgress = filtered.filter(
    (r) => r.isF1 && r.status !== "approved"
  );

  /* =========================
     Open documents modal
  ========================= */
  const openDocuments = async (record) => {
    const res = await api.get(`/hr/visa/${record.user._id}`);
    setDocVisa(res.data.visa);
    setDocUser(record.user);
    setDocOpen(true);
  };

  const openReview = (record) => {
    setReviewRecord(record);
    setReviewFeedback("");
    setReviewOpen(true);
  };

  const handleAction = async (record, action, feedback) => {
    setActionLoading(true);
    try {
      await api.post(`/hr/visa/${record.user._id}/action`, {
        action,
        feedback,
      });
      message.success("Action completed");
      await load();
      setReviewOpen(false);
      setReviewRecord(null);
      setReviewFeedback("");
    } finally {
      setActionLoading(false);
    }
  };

  const getNextStep = (record) => {
    if (!record.isF1) return "—";
    const label = STEP_LABEL[record.activeStep] || "—";
    if (record.status === "pending") {
      return `Waiting for HR approval of ${label}`;
    }
    if (record.status === "rejected") {
      return `Resubmit ${label}`;
    }
    if (record.status === "not_submitted") {
      return `Upload ${label}`;
    }
    return "All documents approved";
  };

  /* =========================
     Columns
  ========================= */

  const baseColumns = [
    {
      title: "Legal Full Name",
      render: (_, r) => {
        const first = r.name?.firstName || "";
        const last = r.name?.lastName || "";
        const full = `${first} ${last}`.trim();
        return full || "—";
      },
    },
    {
      title: "Work Authorization",
      render: (_, r) => r.workAuthorization?.title || "—",
    },
    {
      title: "Current Step",
      render: (_, r) =>
        r.isF1 ? STEP_LABEL[r.activeStep] || "—" : "—",
    },
    {
      title: "Status",
      render: (_, r) => (
        <Tag color={STATUS_COLOR[r.status]}>
          {r.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Days Remaining",
      render: (_, r) => {
        if (r.daysRemaining == null) return "—";
        if (r.daysRemaining < 0) {
          return <Tag color="red">Expired</Tag>;
        }
        return `${r.daysRemaining} days`;
      },
    },
    {
      title: "Next Step",
      render: (_, r) => getNextStep(r),
    },
  ];

  const inProgressColumns = [
    ...baseColumns,
    {
      title: "Action",
      render: (_, r) => {
        if (r.status === "pending") {
          return (
            <Button type="link" onClick={() => openReview(r)}>
              Review
            </Button>
          );
        }

        return (
          <Button
            type="link"
            onClick={() => handleAction(r, "notify_user")}
          >
            Send Notification
          </Button>
        );
      },
    },
  ];

  const allColumns = [
    ...baseColumns,
    {
      title: "Documents",
      render: (_, r) => {
        if (!r.isF1) return "—";
        return (
          <Button type="link" onClick={() => openDocuments(r)}>
            View Docs
          </Button>
        );
      },
    },
  ];

  /* =========================
     Render
  ========================= */

  if (loading) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultActiveKey="in-progress">
        {/* ================= In Progress ================= */}
        <TabPane
          tab={`In Progress (${inProgress.length})`}
          key="in-progress"
        >
          {inProgress.length === 0 ? (
            <Empty description="No in-progress visa cases" />
          ) : (
            <Table
              rowKey={(r) => r.user._id}
              columns={inProgressColumns}
              dataSource={inProgress}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </TabPane>

        {/* ================= All ================= */}
        <TabPane
          tab={`All (${filtered.length})`}
          key="all"
        >
          <Input
            placeholder="Search by username or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
            style={{ maxWidth: 360, marginBottom: 16 }}
          />

          {filtered.length === 0 ? (
            <Empty description="No matching records" />
          ) : (
            <Table
              rowKey={(r) => r.user._id}
              columns={allColumns}
              dataSource={filtered}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </TabPane>
      </Tabs>

      {/* ================= Documents Modal ================= */}
      <VisaDocumentsModal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        visa={docVisa}
        username={docUser?.username}
      />

      {/* ================= Review Modal ================= */}
      <Modal
        open={reviewOpen}
        title={`Review ${STEP_LABEL[reviewRecord?.activeStep] || "Document"} — ${reviewRecord?.user?.username || ""}`}
        onCancel={() => setReviewOpen(false)}
        footer={null}
        width={900}
      >
        {reviewRecord?.activeStepFile ? (
          <iframe
            src={reviewRecord.activeStepFile}
            style={{ width: "100%", height: 520, border: "none" }}
            title="Visa Document"
          />
        ) : (
          <Empty description="No document uploaded" />
        )}

        <Input.TextArea
          rows={3}
          placeholder="Rejection feedback (visible to employee)"
          value={reviewFeedback}
          onChange={(e) => setReviewFeedback(e.target.value)}
          style={{ marginTop: 16 }}
        />

        <Space style={{ marginTop: 12 }}>
          <Button
            type="primary"
            loading={actionLoading}
            onClick={() => handleAction(reviewRecord, "approve")}
          >
            Approve
          </Button>
          <Button
            danger
            loading={actionLoading}
            onClick={() =>
              handleAction(reviewRecord, "reject", reviewFeedback)
            }
          >
            Reject
          </Button>
          {reviewRecord?.activeStepFile && (
            <Button
              type="link"
              href={reviewRecord.activeStepFile}
              download
            >
              Download
            </Button>
          )}
        </Space>
      </Modal>
    </>
  );
}
