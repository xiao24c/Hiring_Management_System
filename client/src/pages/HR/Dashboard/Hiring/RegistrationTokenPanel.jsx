import { Card, Table, Button, Input, Space, Tag, Typography, Alert } from "antd";
import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";

const { Title, Text } = Typography;

export default function RegistrationTokenPanel() {
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hr/tokens");
      setTokens(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleGenerate = async () => {
    if (!email) {
      message.error("Please enter an email");
      return;
    }

    try {
      const res = await api.post("/hr/tokens", { email });
      if (res.data?.alreadyRegistered) {
        const msg = res.data.msg || "This email is already registered.";
        setNotice({ type: "warning", message: msg });
      } else if (res.data?.alreadySent) {
        const msg =
          "A valid token was already sent. The same link has been resent.";
        setNotice({ type: "info", message: msg, link: res.data.registerLink });
      } else {
        setNotice({
          type: "success",
          message: res.data?.msg || "Registration token generated",
        });
      }
      setEmail("");
      loadTokens();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to generate token";
      setNotice({ type: "error", message: msg });
    }
  };

  const now = Date.now();

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (v) => v || "-",
    },
    {
      title: "Registration Link",
      render: (_, r) => (
        <a
          href={r.registerLink || `/register?token=${r.token}`}
          target="_blank"
          rel="noreferrer"
        >
          /register?token=***
        </a>
      ),
    },
    {
      title: "Status",
      render: (_, r) => {
        if (r.used) return <Tag color="green">USED</Tag>;
        if (new Date(r.expiresAt).getTime() < now)
          return <Tag color="red">EXPIRED</Tag>;
        return <Tag color="blue">VALID</Tag>;
      },
    },
    {
      title: "Expires At",
      render: (_, r) => new Date(r.expiresAt).toLocaleString(),
    },
    {
      title: "Onboarding Submitted",
      render: (_, r) =>
        r.onboardingStatus && r.onboardingStatus !== "not_submitted" ? (
          <Tag color="green">{r.onboardingStatus.toUpperCase()}</Tag>
        ) : (
          <Tag>Not submitted</Tag>
        ),
    },
  ];

  return (
    <Card>
      <Title level={4}>Registration Tokens</Title>

      {notice && (
        <Alert
          type={notice.type}
          message={notice.message}
          description={
            notice.link ? (
              <a href={notice.link} target="_blank" rel="noreferrer">
                {notice.link}
              </a>
            ) : null
          }
          closable
          onClose={() => setNotice(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="New employee email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={handleGenerate}>
          Generate Token & Send Email
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={tokens}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />
    </Card>
  );
}
