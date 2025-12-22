import { Form, Typography } from "antd";
import FileUploadField from "../shared/FileUploadField";

const { Link, Text } = Typography;

export default function PersonalDocumentsSection({ readOnly = false }) {
  return (
    <>
      <h3>Documents</h3>

      <Form.Item label="Driver's License" shouldUpdate>
        {({ getFieldValue }) => {
          const url = getFieldValue("driverLicenseUrl");

          if (readOnly) {
            if (!url) return <Text type="secondary">Not uploaded</Text>;
            return (
              <Link href={url} target="_blank" rel="noreferrer">
                Preview / Download
              </Link>
            );
          }

          return (
            <Form.Item
              noStyle
              name="driverLicenseUrl"
              valuePropName="value"
            >
              <FileUploadField accept=".pdf,image/*" />
            </Form.Item>
          );
        }}
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const isCitizen = getFieldValue(["visaInfo", "isCitizenOrPR"]);
          const workAuth = getFieldValue(["visaInfo", "workAuthorization"]);
          const showWorkDoc = isCitizen === false && workAuth === "F1";

          if (!showWorkDoc) {
            return (
              <Text type="secondary">
                Work authorization document not required.
              </Text>
            );
          }

          return (
            <Form.Item
              label="Work Authorization Document"
              shouldUpdate
            >
              {({ getFieldValue }) => {
                const url = getFieldValue(["visaInfo", "optReceiptUrl"]);

                if (readOnly) {
                  if (!url) return <Text type="secondary">Not uploaded</Text>;
                  return (
                    <Link href={url} target="_blank" rel="noreferrer">
                      Preview / Download
                    </Link>
                  );
                }

                return (
                  <Form.Item
                    noStyle
                    name={["visaInfo", "optReceiptUrl"]}
                    valuePropName="value"
                  >
                    <FileUploadField accept=".pdf,image/*" />
                  </Form.Item>
                );
              }}
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
}
