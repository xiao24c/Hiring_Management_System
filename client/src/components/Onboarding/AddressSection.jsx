// src/components/Onboarding/AddressSection.jsx
import { Form, Input, Row, Col } from "antd";

export default function AddressSection({ readOnly = false }) {
  return (
    <>
      <h3>Current Address</h3>

      <Form.Item
        label="Building / Apt #"
        name={["address", "buildingApt"]}
      >
        <Input
          placeholder="Building / Apt #"
          disabled={readOnly}
        />
      </Form.Item>

      <Form.Item
        label="Street"
        name={["address", "street"]}
        rules={[{ required: true, message: "Please enter street" }]}
      >
        <Input
          placeholder="Street address"
          disabled={readOnly}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="City"
            name={["address", "city"]}
            rules={[{ required: true, message: "Please enter city" }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="State"
            name={["address", "state"]}
            rules={[{ required: true, message: "Please enter state" }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="ZIP"
            name={["address", "zip"]}
            rules={[{ required: true, message: "Please enter ZIP" }]}
          >
            <Input disabled={readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
