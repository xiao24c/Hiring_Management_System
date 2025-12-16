import { Form, Input, Row, Col } from "antd";

export default function ReferenceSection({ readOnly = false }) {
  return (
    <>
      <h3>Reference</h3>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="First Name" name={["reference", "firstName"]} rules={[{ required: true }]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Last Name" name={["reference", "lastName"]} rules={[{ required: true }]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Middle Name" name={["reference", "middleName"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Phone" name={["reference", "phone"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Email" name={["reference", "email"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Relationship" name={["reference", "relationship"]} rules={[{ required: true }]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}