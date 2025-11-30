import { useState } from "react";
import { getAssetUrl } from "../services/api.js";
import { documentLabels } from "../utils/constants.js";

const DocumentList = ({ documents = [], showStatus = true }) => {
  const [previewDoc, setPreviewDoc] = useState(null);
  if (!documents.length) return <p className="helper-text">No documents uploaded yet.</p>;

  return (
    <>
      <ul className="documents-list">
        {documents.map((doc) => (
          <li key={`${doc.type}-${doc.fileName || doc.url}`} className="document-row">
            <div>
              <strong>{doc.label || documentLabels[doc.type] || doc.type}</strong>
              {doc.feedback && <p className="helper-text">{doc.feedback}</p>}
            </div>
            <div className="document-row__actions">
              {showStatus && (
                <span className={`status-pill ${doc.status || ""}`}>{doc.status || "uploaded"}</span>
              )}
              {doc.url && (
                <>
                  <a className="primary-button" href={getAssetUrl(doc.url)} target="_blank" rel="noreferrer">
                    Download
                  </a>
                  <button className="link-button" type="button" onClick={() => setPreviewDoc(doc)}>
                    Preview
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="section-card__header">
              <h3>{previewDoc.label}</h3>
              <button className="link-button" onClick={() => setPreviewDoc(null)}>
                Close
              </button>
            </header>
            <iframe
              src={getAssetUrl(previewDoc.url)}
              title="document-preview"
              style={{ width: "100%", height: "70vh", border: "1px solid #cbd5f5" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentList;
