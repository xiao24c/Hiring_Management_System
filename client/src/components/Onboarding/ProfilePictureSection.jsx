import { Form, Typography } from "antd";
import FileUploadField from "../shared/FileUploadField";

const { Link, Text } = Typography;

const PLACEHOLDER_SRC = "/avatar-placeholder.svg";

export default function ProfilePictureSection({ readOnly = false }) {
  return (
    <>
      <h3>Profile Picture</h3>
      <Form.Item label="Profile Picture" shouldUpdate>
        {({ getFieldValue }) => {
          const url = getFieldValue("profilePictureUrl");
          const src = url || PLACEHOLDER_SRC;

          return (
            <div>
              <img
                src={src}
                alt="Profile"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                  marginBottom: 12,
                  border: "1px solid #e5e7eb",
                }}
              />

              {readOnly ? (
                url ? (
                  <Link href={url} target="_blank" rel="noreferrer">
                    Preview / Download
                  </Link>
                ) : (
                  <Text type="secondary">Not uploaded</Text>
                )
              ) : (
                <Form.Item name="profilePictureUrl" valuePropName="value" noStyle>
                  <FileUploadField accept="image/*" />
                </Form.Item>
              )}
            </div>
          );
        }}
      </Form.Item>
    </>
  );
}
