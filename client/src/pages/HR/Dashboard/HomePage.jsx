import { Card, Space, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function HRHomePage() {
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 900, margin: "24px auto" }}>
      <Title level={3}>HR Dashboard</Title>
      <Text type="secondary">
        Welcome! Use the shortcuts below to manage employees, visa cases,
        and onboarding.
      </Text>

      <Space style={{ marginTop: 24 }}>
        <Button type="primary" onClick={() => navigate("/hr/employees")}>
          Employee Profiles
        </Button>
        <Button onClick={() => navigate("/hr/visa")}>
          Visa Status Management
        </Button>
        <Button onClick={() => navigate("/hr/hiring")}>
          Hiring Management
        </Button>
      </Space>
    </Card>
  );
}
