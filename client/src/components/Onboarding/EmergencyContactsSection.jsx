import { Form, Input, Row, Col, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function EmergencyContactsSection({ readOnly = false }) {
  return (
    <>
      <h3>Emergency Contact(s)</h3>

      <Form.List
        name="emergencyContacts"
        rules={[
          {
            validator: async (_, value) =>
              !value || value.length < 1
                ? Promise.reject("Please add at least one emergency contact")
                : Promise.resolve(),
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  {["firstName", "lastName", "middleName", "phone", "email", "relationship"].map((k) => (
                    <Col span={8} key={k}>
                      <Form.Item
                        name={[field.name, k]}
                        label={k}
                        rules={k !== "middleName" && k !== "phone" && k !== "email" ? [{ required: true }] : []}
                      >
                        <Input disabled={readOnly} />
                      </Form.Item>
                    </Col>
                  ))}

                  {!readOnly && fields.length > 1 && (
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Col>
                  )}
                </Row>
              </div>
            ))}

            {!readOnly && (
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Add Emergency Contact
              </Button>
            )}
          </>
        )}
      </Form.List>
    </>
  );
}