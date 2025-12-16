import {
  Tabs,
  Table,
  Tag,
  Button,
  Input,
  Empty,
  Spin,
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

  const navigate = useNavigate();

  /* =========================
     Load summary list
  ========================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/hr/visa");
        setData(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* =========================
     Search (username + email)
  ========================= */
  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();

    return data.filter((r) => {
      const username = r.user?.username?.toLowerCase() || "";
      const email = r.user?.email?.toLowerCase() || "";
      return username.includes(q) || email.includes(q);
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

  /* =========================
     Columns
  ========================= */

  const baseColumns = [
    {
      title: "Employee",
      render: (_, r) => r.user?.username || "—",
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
  ];

  const inProgressColumns = [
    ...baseColumns,
    {
      title: "Action",
      render: (_, r) => (
        <Button
          type="link"
          onClick={() => navigate(`/hr/visa/${r.user._id}`)}
        >
          View
        </Button>
      ),
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
    </>
  );
}