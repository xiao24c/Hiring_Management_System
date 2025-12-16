// src/pages/HR/Dashboard/Hiring/RegistrationTokenPanel.jsx
import { Card, Table, Button, Input, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";

const { Title, Text } = Typography;

export default function RegistrationTokenPanel() {
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

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
      await api.post("/hr/tokens", { email });
      message.success("Registration token generated");
      setEmail("");
      loadTokens();
    } catch (err) {
      message.error(err.response?.data?.msg || "Failed to generate token");
    }
  };

  const now = Date.now();

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Registration Link",
      render: (_, r) => (
        <a
          href={`/register?token=${r.token}`}
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
  ];

  return (
    <Card>
      <Title level={4}>Registration Tokens</Title>

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
      />
    </Card>
  );
}