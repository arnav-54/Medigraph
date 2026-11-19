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
    let intervalId = null;

    async function fetchDoc() {
      try {
        const res = await api.get(`/api/v1/documents/${id}`);
        if (res.success && res.data?.document) {
          setDocument(res.data.document);
          // If still queued or processing, poll every 2 seconds
          if (['QUEUED', 'PROCESSING', 'UPLOADED'].includes(res.data.document.processingStatus)) {
            intervalId = setTimeout(fetchDoc, 2000);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch document details');
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${document.originalFilename}"? This will permanently remove this record and associated extractions.`)) {
      try {
        await api.delete(`/api/v1/documents/${id}`);
        navigate('/documents');
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          QUERYING SPECIMEN PROVENANCE LEDGER...
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="alert alert-warning">
        <span>⚠️</span>
        <span>{error || 'Document record not found in cryptographic vault.'}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Section Indicator */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="section-indicator">SECTION 03.1 · PROVENANCE INSPECTOR</span>
      </div>

      {/* Page Masthead */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--hairline)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)'
            }}>
              {document.originalFilename}
            </h1>
            <StatusBadge status={document.processingStatus} />
          </div>
          <p style={{ fontSize: '0.785rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
            SPECIMEN UUID: {document.id}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to={`/documents/${id}/extractions`}
            className="btn btn-primary"
            style={{ fontWeight: 600 }}
          >
            <span>🔬</span> Audit Extractions ({document._count?.extractedRecords || 0})
          </Link>
          <a
            href={`/api/v1/documents/${id}/download`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            <span>📥</span> Download File
          </a>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            Purge
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid-2">
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--hairline)' }}>
            <div>
              <div className="section-indicator" style={{ marginBottom: '0.25rem' }}>CRYPTOGRAPHIC AUDIT</div>
              <h2 className="card-title">Binary Integrity & Storage Provenance</h2>
            </div>
          </div>

          <table className="clinical-table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: '40%', color: 'var(--ink-secondary)' }}>MIME Content Type</td>
                <td>
                  <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                    {document.mimeType}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>File Payload Size</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {(document.fileSize / 1024).toFixed(1)} KB ({document.fileSize.toLocaleString()} bytes)
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>Parsed Page Count</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {document.pageCount || 1} processed page(s)
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>Ingestion Timestamp</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                  {new Date(document.uploadedAt).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>SHA-256 Digest</td>
                <td style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  color: 'var(--cobalt)',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sharp)'
                }}>
                  {document.sha256Checksum}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--hairline)' }}>
            <div>
              <div className="section-indicator" style={{ marginBottom: '0.25rem' }}>OCR & NORMALIZATION</div>
              <h2 className="card-title">Laboratory Extraction Status</h2>
            </div>
          </div>

          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-subtle)',
            marginBottom: '1.5rem',
            border: '1px solid var(--hairline)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Pipeline Lifecycle State
              </span>
              <StatusBadge status={document.processingStatus} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
              {document.processingStatus === 'COMPLETED' || document.processingStatus === 'REVIEW_REQUIRED'
                ? `Biomarker extraction finished. ${document._count?.extractedRecords || 0} clinical markers were parsed and mapped to canonical laboratory reference standards.`
                : 'OCR engine is actively parsing document layout, coordinates, and optical bounding boxes.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>Extracted Biomarkers</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--cobalt)' }}>
                {document._count?.extractedRecords || 0}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>Document Pages</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--ink-primary)' }}>
                {document.pageCount || 1}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>Tenant Isolation</span>
              <span className="status-pill status-pill-normal" style={{ fontSize: '0.65rem' }}>
                Strict Vault Isolation Enforced
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <Link
              to={`/documents/${id}/extractions`}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Open Extraction Review Terminal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
