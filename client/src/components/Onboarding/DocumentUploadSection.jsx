import { Form, Typography } from "antd";
import FileUploadField from "../shared/FileUploadField";

const { Link, Text } = Typography;

export default function DocumentUploadSection({ readOnly = false }) {
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
    </>
  );
}
