import { Form, Input } from "antd";

export default function ProfilePictureSection({ readOnly = false }) {
  if (readOnly) return null;

  return (
    <>
      <h3>Profile Picture</h3>
      <Form.Item label="Profile Picture URL" name="profilePictureUrl">
        <Input />
      </Form.Item>
    </>
  );
}