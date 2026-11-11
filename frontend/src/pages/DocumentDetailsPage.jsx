import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function DocumentDetailsPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await api.get(`/api/v1/documents/${id}`);
        if (res.success && res.data?.document) {
          setDocument(res.data.document);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch document details');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${document.originalFilename}"?`)) {
      try {
        await api.delete(`/api/v1/documents/${id}`);
        navigate('/documents');
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading document details...</div>;
  if (error || !document) return <div className="alert alert-warning">{error || 'Document not found'}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{document.originalFilename}</h1>
            <StatusBadge status={document.processingStatus} />
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>ID: {document.id}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/documents/${id}/extractions`} className="btn btn-primary">
            Review Extractions ({document._count?.extractedRecords || 0})
          </Link>
          <a
            href={`/api/v1/documents/${id}/download`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            Download File
          </a>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            Delete
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Document Metadata & Security</h2>
          <table className="data-table" style={{ marginTop: '1rem' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: '40%' }}>MIME Type</td>
                <td>{document.mimeType}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>File Size</td>
                <td>{(document.fileSize / 1024).toFixed(1)} KB</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Page Count</td>
                <td>{document.pageCount || 1} page(s)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Uploaded Date</td>
                <td>{new Date(document.uploadedAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>SHA-256 Checksum</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {document.sha256Checksum}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="card-title">Asynchronous Processing & Jobs</h2>
          {document.processingJobs && document.processingJobs.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {document.processingJobs.map((job) => (
                <div key={job.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Job ID: {job.id.slice(0, 8)}...</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Attempts: {job.attempts} of {job.maxAttempts} • Created: {new Date(job.createdAt).toLocaleTimeString()}
                  </div>
                  {job.lastError && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      Error: {job.lastError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>No job history available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
