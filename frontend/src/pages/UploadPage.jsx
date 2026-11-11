import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Client-side size check (15MB)
      if (selected.size > 15 * 1024 * 1024) {
        setError('Selected file exceeds maximum allowable size of 15MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF, PNG, or JPEG file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/v1/documents', formData);
      if (res.success && res.data?.document) {
        navigate(`/documents/${res.data.document.id}`);
      }
    } catch (err) {
      setError(err.message || 'Upload failed. The document could not be processed.');
    } finally {
      setUploading(false);
    }
  };

  // Generates and uploads a synthetic laboratory report directly from client
  const handleLoadSyntheticSample = async () => {
    setUploading(true);
    setError(null);

    try {
      // Create synthetic PDF client-side
      const pdfText = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 380 >>
stream
BT
/F1 10 Tf
1 0 0 1 50 720 Tm (METROPOLITAN HEALTH LABORATORY) Tj
1 0 0 1 50 700 Tm (Patient: Jane Doe | DOB: 1985-04-12 | Collected: 2024-03-15) Tj
1 0 0 1 50 670 Tm (TEST NAME RESULT UNIT REFERENCE RANGE FLAG) Tj
1 0 0 1 50 650 Tm (Hemoglobin 14.2 g/dL 12.0 - 16.0 NORMAL) Tj
1 0 0 1 50 630 Tm (Fasting Blood Glucose 118 mg/dL 70 - 99 HIGH) Tj
1 0 0 1 50 610 Tm (HbA1c 5.9 % 4.0 - 5.6 HIGH) Tj
1 0 0 1 50 590 Tm (Serum Creatinine 0.95 mg/dL 0.60 - 1.20 NORMAL) Tj
1 0 0 1 50 570 Tm (Total Cholesterol 210 mg/dL < 200 HIGH) Tj
1 0 0 1 50 550 Tm (HDL Cholesterol 55 mg/dL > 40 NORMAL) Tj
1 0 0 1 50 530 Tm (LDL Cholesterol 132 mg/dL < 100 HIGH) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000307 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
750
%%EOF`;

      const blob = new Blob([pdfText], { type: 'application/pdf' });
      const syntheticFile = new File([blob], `synthetic_lab_report_${Date.now().toString().slice(-4)}.pdf`, {
        type: 'application/pdf'
      });

      const formData = new FormData();
      formData.append('file', syntheticFile);

      const res = await api.post('/api/v1/documents', formData);
      if (res.success && res.data?.document) {
        navigate(`/documents/${res.data.document.id}`);
      }
    } catch (err) {
      setError(err.message || 'Synthetic document upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Upload Medical Record</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Securely ingest clinical PDFs, laboratory panels, or diagnostic scans.
        </p>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleUpload}>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'border-color 0.15s ease'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {file ? file.name : 'Click to select or drag and drop a medical report'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Supported formats: PDF, PNG, JPEG (Max file size: 15MB)
            </div>
            {file && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--primary)' }}>
                {(file.size / 1024).toFixed(1)} KB selected
              </div>
            )}
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!file || uploading}
            >
              {uploading ? 'Validating & Uploading...' : 'Upload & Process Document'}
            </button>
            <button
              type="button"
              onClick={handleLoadSyntheticSample}
              className="btn btn-secondary"
              disabled={uploading}
            >
              Load Synthetic Sample Report
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none' }}>
        <h3 style={{ fontSize: '0.925rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          🛡️ Ingestion Security & Safeguards:
        </h3>
        <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
          <li><strong>Magic Byte Validation:</strong> Inspects authentic binary signatures (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`) to prevent extension spoofing.</li>
          <li><strong>Cryptographic Deduplication:</strong> Prevents accidental duplicate uploads using SHA-256 fingerprinting.</li>
          <li><strong>Provenance Isolation:</strong> All files are stored in tenant-isolated secure paths and never executed.</li>
        </ul>
      </div>
    </div>
  );
}
