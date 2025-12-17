import { Form, Radio, Select, DatePicker, Row, Col, Typography } from "antd";
import FileUploadField from "../shared/FileUploadField";
const { Option } = Select;
const { Link, Text } = Typography;

export default function WorkAuthorizationSection({
  readOnly = false,
  showOptReceipt = true,
}) {
  return (
    <>
      <h3>Work Authorization</h3>

      <Form.Item
        label="Permanent resident or citizen of the U.S.?"
        name={["visaInfo", "isCitizenOrPR"]}
        rules={[{ required: true }]}
      >
        <Radio.Group disabled={readOnly}>
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const isPR = getFieldValue(["visaInfo", "isCitizenOrPR"]);

          if (isPR === true) {
            return (
              <Form.Item name={["visaInfo", "status"]} rules={[{ required: true }]}>
                <Select disabled={readOnly}>
                  <Option value="Citizen">Citizen</Option>
                  <Option value="Green Card">Green Card</Option>
                </Select>
              </Form.Item>
            );
          }

          if (isPR === false) {
            const workAuth = getFieldValue(["visaInfo", "workAuthorization"]);

            return (
              <>
                <Form.Item name={["visaInfo", "workAuthorization"]} rules={[{ required: true }]}>
                  <Select disabled={readOnly}>
                    <Option value="H1B">H1-B</Option>
                    <Option value="L2">L2</Option>
                    <Option value="F1">F1 (CPT / OPT)</Option>
                    <Option value="H4">H4</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                {showOptReceipt && workAuth === "F1" && (
                  <Form.Item
                    label="OPT Receipt"
                    name={["visaInfo", "optReceiptUrl"]}
                    valuePropName="value"
                    rules={[{ required: true, message: "OPT Receipt is required" }]}
                    shouldUpdate={readOnly}
                  >
                    {readOnly
                      ? ({ getFieldValue }) => {
                          const url = getFieldValue(["visaInfo", "optReceiptUrl"]);
                          if (!url) return <Text type="secondary">Not uploaded</Text>;
                          return (
                            <Link href={url} target="_blank" rel="noreferrer">
                              Preview / Download
                            </Link>
                          );
                        }
                      : <FileUploadField accept=".pdf,image/*" />}
                  </Form.Item>
                )}

                {workAuth === "Other" && (
                  <Form.Item name={["visaInfo", "otherTitle"]} rules={[{ required: true }]}>
                    <Input disabled={readOnly} />
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name={["visaInfo", "startDate"]} rules={[{ required: true }]}>
                      <DatePicker disabled={readOnly} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={["visaInfo", "endDate"]} rules={[{ required: true }]}>
                      <DatePicker disabled={readOnly} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            );
          }

          return null;
        }}
      </Form.Item>
    </>
  );
}
