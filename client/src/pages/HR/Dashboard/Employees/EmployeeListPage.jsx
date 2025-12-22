import { Card, Input, Table, Typography, Empty } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axiosInstance";

const { Title, Text, Link } = Typography;

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/hr/employees");
        setEmployees(res.data.employees || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* =========================
     搜索：first / last / preferred
  ========================== */
  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return employees;

    return employees.filter((e) => {
      const first = e.name?.firstName?.toLowerCase() || "";
      const last = e.name?.lastName?.toLowerCase() || "";
      const preferred = e.name?.preferredName?.toLowerCase() || "";

      return (
        first.includes(q) ||
        last.includes(q) ||
        preferred.includes(q)
      );
    });
  }, [employees, query]);

  const columns = [
    {
      title: "Name",
      render: (_, record) => {
        const fullName = `${record.name?.firstName || ""} ${record.name?.lastName || ""}`.trim();

        return (
          <Link onClick={() => navigate(`/hr/employees/${record.userId}`)}>
            {fullName || "—"}
          </Link>
        );
      },
    },
    {
      title: "SSN",
      dataIndex: "ssn",
      render: (v) => v || "—",
    },
    {
      title: "Work Authorization",
      dataIndex: "workAuthorization",
      render: (v) => v || "—",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (v) => v || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
  ];

  return (
    <Card>
      <Title level={3}>
        Employee Profiles
        <Text type="secondary" style={{ marginLeft: 12 }}>
          ({employees.length})
        </Text>
      </Title>

      <Input
        placeholder="Search by first name, last name, or preferred name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
        style={{ maxWidth: 420, marginBottom: 16 }}
      />

      {filteredEmployees.length === 0 ? (
        <Empty description="No matching employees found" />
      ) : (
        <Table
          rowKey="userId"
          loading={loading}
          columns={columns}
          dataSource={filteredEmployees}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
}
