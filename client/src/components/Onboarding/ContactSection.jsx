import { Form, Input, Row, Col } from "antd";

export default function ContactSection({ userEmail, readOnly = false }) {
  return (
    <>
      <h3>Contact Information</h3>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Cell Phone"
            name={["contactInfo", "cellPhone"]}
            rules={[{ required: true }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Work Phone" name={["contactInfo", "workPhone"]}>
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Email">
        <Input value={userEmail} disabled />
      </Form.Item>
    </>
  );
}