import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, Shield, X, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Alert } from '../components/ui';

export function UploadPage() {
  const { lang, t } = useLanguage();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 15 * 1024 * 1024) {
        setError('Selected file exceeds maximum allowable size of 15MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 15 * 1024 * 1024) {
        setError('Selected file exceeds maximum allowable size of 15MB.');
        return;
      }
      setFile(dropped);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError('Please select a laboratory report (PDF, PNG, or JPEG) to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/v1/documents', formData);
      if (res.success && res.data?.document) {
        navigate(`/documents/${res.data.document.id}/extractions`);
      }
    } catch (err) {
      setError(err.message || 'Report ingestion failed. Please verify the document format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BiomarkerDictionaryModal isOpen={dictionaryOpen} onClose={() => setDictionaryOpen(false)} />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Upload Diagnostic Report
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '4px' }}>
            Ingest lab panels for deterministic OCR extraction, normal range comparison, and trend tracking.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={BookOpen}
          onClick={() => setDictionaryOpen(true)}
        >
          Biomarker Guide
        </Button>
      </div>

      {error && (
        <Alert variant="critical" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Dropzone Card */}
      <Card>
        <CardContent style={{ padding: '32px 24px' }}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              borderRadius: 'var(--radius-xl)',
              border: `2px dashed ${dragActive ? '#065F46' : 'var(--border-strong)'}`,
              backgroundColor: dragActive ? 'var(--accent-subtle)' : '#FAFCFB',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => document.getElementById('report-file-input')?.click()}
          >
            <input
              id="report-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
            }}>
              <UploadCloud size={28} strokeWidth={2.2} />
            </div>

            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Select diagnostic report or drop file here
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '6px', maxWidth: '400px', lineHeight: 1.5 }}>
              Supports official lab report PDFs, scans, and camera photos up to 15MB.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '18px' }}>
              {['CBC Panel', 'Metabolic / KFT', 'Lipid Profile', 'Thyroid TSH', 'Vitamin D & B12'].map((badge) => (
                <span
                  key={badge}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--ink-secondary)'
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Selected File Stage */}
          {file && (
            <div style={{ marginTop: '20px', padding: '14px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--ink)' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for OCR
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  aria-label="Remove file"
                >
                  <X size={14} />
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  loading={uploading}
                  onClick={handleUpload}
                  iconRight={ArrowRight}
                >
                  Parse & Extract
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety & Isolation Guarantee */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
            <span>Vault Isolation</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', lineHeight: 'var(--leading-xs)' }}>
            Each file is verified with SHA-256 fingerprinting and stored in an isolated patient directory.
          </p>
        </div>

        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
            <span>Dual Confidence</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', lineHeight: 'var(--leading-xs)' }}>
            Optical character clarity and physiological bounds are scored prior to ledger verification.
          </p>
        </div>
      </div>
    </div>
  );
}
