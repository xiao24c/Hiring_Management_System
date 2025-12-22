import { Card, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

export default function HRHomePage() {
  return (
    <Card style={{ maxWidth: 900, margin: "24px auto" }}>
      <Title level={3}>HR Dashboard</Title>
      <Paragraph type="secondary">
        Welcome! Use the sidebar to navigate Employee Profiles, Visa Status
        Management, and Hiring Management.
      </Paragraph>
      <Text type="secondary">
        All key actions are available via the left navigation.
      </Text>
    </Card>
  );
}
