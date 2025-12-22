import { Form, Input, DatePicker, Radio, Row, Col } from "antd";

export default function LegalSection({ readOnly = false }) {
  return (
    <>
      <h3>Legal Information</h3>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="SSN"
            name={["legalInfo", "ssn"]}
            rules={[{ required: true }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Date of Birth"
            name={["legalInfo", "dateOfBirth"]}
            rules={[{ required: true }]}
          >
            <DatePicker disabled={readOnly} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Gender"
        name={["legalInfo", "gender"]}
        rules={[{ required: true }]}
      >
        <Radio.Group disabled={readOnly}>
          <Radio value="male">Male</Radio>
          <Radio value="female">Female</Radio>
          <Radio value="I don't wish to answer">
            I do not wish to answer
          </Radio>
        </Radio.Group>
      </Form.Item>
    </>
  );
}
