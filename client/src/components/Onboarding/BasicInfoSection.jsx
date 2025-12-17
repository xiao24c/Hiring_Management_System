import { Form, Input, Row, Col } from "antd";

export default function BasicInfoSection({ readOnly = false }) {
  return (
    <>
      <h3>Basic Information</h3>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="First Name"
            name={["name", "firstName"]}
            rules={[{ required: true }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Last Name"
            name={["name", "lastName"]}
            rules={[{ required: true }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Middle Name" name={["name", "middleName"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Preferred Name" name={["name", "preferredName"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
