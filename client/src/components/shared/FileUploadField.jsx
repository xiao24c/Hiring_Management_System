import { useState } from "react";
import { Upload, Button, Space, Typography, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../../api/axiosInstance";

const { Link } = Typography;

export default function FileUploadField({
  value,
  onChange,
  disabled = false,
  buttonText = "Upload File",
  accept,
}) {
  const [uploading, setUploading] = useState(false);

  const customRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange?.(res.data.fileUrl);
      message.success("Uploaded");
      onSuccess?.();
    } catch (err) {
      message.error(err.response?.data?.msg || "Upload failed");
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Upload
        accept={accept}
        showUploadList={false}
        customRequest={customRequest}
        disabled={disabled || uploading}
      >
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={disabled}
        >
          {value ? "Replace File" : buttonText}
        </Button>
      </Upload>

      {value && (
        <Space style={{ marginTop: 8 }}>
          <Link href={value} target="_blank">
            Preview
          </Link>
          <Link href={value} download>
            Download
          </Link>
        </Space>
      )}
    </div>
  );
}
