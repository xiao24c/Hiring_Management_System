import { Form, Typography } from "antd";
import FileUploadField from "../shared/FileUploadField";

const { Link, Text } = Typography;

export default function PersonalDocumentsSection({ readOnly = false }) {
  return (
    <>
      <h3>Documents</h3>

      <Form.Item
        label="Driver's License"
        name="driverLicenseUrl"
        valuePropName="value"
        shouldUpdate={readOnly}
      >
        {readOnly
          ? ({ getFieldValue }) => {
              const url = getFieldValue("driverLicenseUrl");
              if (!url) return <Text type="secondary">Not uploaded</Text>;
              return (
                <Link href={url} target="_blank" rel="noreferrer">
                  Preview / Download
                </Link>
              );
            }
          : <FileUploadField accept=".pdf,image/*" />}
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
              name={["visaInfo", "optReceiptUrl"]}
              valuePropName="value"
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
          );
        }}
      </Form.Item>
    </>
  );
}
