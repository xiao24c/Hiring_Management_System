import { useState } from "react";
import api from "../services/api.js";
import { documentLabels } from "../utils/constants.js";

const DocumentUpload = ({ type, onUploaded, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (disabled) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setMessage(null);
    try {
      const { data } = await api.post(`/employee/documents/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUploaded?.(data.document);
      setMessage({ type: "success", text: `${documentLabels[type]} uploaded.` });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Upload failed." });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="input-group">
      <label>{documentLabels[type] || type}</label>
      <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} disabled={uploading || disabled} />
      {message && (
        <p className="helper-text" style={{ color: message.type === "error" ? "#b91c1c" : "#15803d" }}>
          {message.text}
        </p>
      )}
      {disabled && <p className="helper-text">Uploads disabled while HR is reviewing.</p>}
    </div>
  );
};

export default DocumentUpload;
