import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';

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
        setError(lang === 'hi' ? 'फ़ाइल का साइज़ 15MB से अधिक नहीं होना चाहिए।' : 'Selected file exceeds maximum allowable size of 15MB.');
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
        setError(lang === 'hi' ? 'फ़ाइल का साइज़ 15MB से अधिक नहीं होना चाहिए।' : 'Selected file exceeds maximum allowable size of 15MB.');
        return;
      }
      setFile(dropped);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError(lang === 'hi' ? 'कृपया अपलोड करने के लिए एक मेडिकल रिपोर्ट (PDF या फ़ोटो) चुनें।' : 'Please select a medical report (PDF, PNG, or JPEG) to upload.');
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
      setError(err.message || (lang === 'hi' ? 'रिपोर्ट प्रोसेस नहीं हो सकी। कृपया दोबारा प्रयास करें।' : 'Document could not be processed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  // Instant Sample Report Generator for 1-click test
  const handleLoadSampleReport = async () => {
    setUploading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const samplePdfContent = `%PDF-1.4
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
<< /Length 850 >>
stream
BT
/F1 12 Tf
50 720 Td
(METROPOLITAN HEALTH DIAGNOSTICS - COMPREHENSIVE LAB PANEL) Tj
0 -24 Td
(Patient Name: Jane Doe   |   Date: 15 November 2026   |   Gender: Female) Tj
0 -26 Td
(TEST NAME                RESULT    UNIT     REFERENCE RANGE    FLAG) Tj
0 -18 Td
(Hemoglobin              14.5      g/dL     12.0 - 15.5        NORMAL) Tj
0 -18 Td
(Total Cholesterol       185       mg/dL    < 200              NORMAL) Tj
0 -18 Td
(HDL Cholesterol         58        mg/dL    > 50               NORMAL) Tj
0 -18 Td
(LDL Cholesterol         110       mg/dL    < 100              HIGH) Tj
0 -18 Td
(Triglycerides           142       mg/dL    < 150              NORMAL) Tj
0 -18 Td
(Fasting Blood Glucose   94        mg/dL    70 - 99            NORMAL) Tj
0 -18 Td
(HbA1c                   5.4       %        < 5.7              NORMAL) Tj
0 -18 Td
(Serum Creatinine        0.88      mg/dL    0.55 - 1.10        NORMAL) Tj
0 -18 Td
(Vitamin D (25-OH)       38.2      ng/mL    30.0 - 100.0       NORMAL) Tj
0 -18 Td
(Vitamin B12             540       pg/mL    211 - 911          NORMAL) Tj
0 -18 Td
(TSH                     2.45      uIU/mL   0.45 - 4.50        NORMAL) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000323 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1225
%%EOF`;

      const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], `comprehensive_health_panel_${timestamp}.pdf`, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', sampleFile);

      const res = await api.post('/api/v1/documents', formData);
      if (res.success && res.data?.document) {
        navigate(`/documents/${res.data.document.id}/extractions`);
      }
    } catch (err) {
      setError(err.message || 'Sample generation failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Test Guide Modal */}
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
      />

      {/* Section Indicator */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="section-indicator">SECTION 02 · {lang === 'hi' ? 'रिपोर्ट अपलोड' : 'DOCUMENT INGESTION'}</span>
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
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--ink-primary)',
            marginBottom: '0.35rem'
          }}>
            {t.uploadTitle}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
            {t.uploadSubtitle}
          </p>
        </div>

        <button
          onClick={() => setDictionaryOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ fontWeight: 600 }}
        >
          <span>📖</span> {lang === 'hi' ? 'टेस्ट गाइड देखें' : 'View Test Guide'}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Dropzone Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-press)' }}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--cobalt)' : '#CCD2C4'}`,
            borderRadius: 'var(--radius-card)',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: dragActive ? '#F0F6FB' : '#FAFBF8',
            transition: 'all 0.15s ease',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('reportFileInput').click()}
        >
          <input
            id="reportFileInput"
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#EBF3FA',
            color: 'var(--cobalt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
            boxShadow: '0 2px 8px rgba(13, 62, 107, 0.15)'
          }}>
            📄
          </div>

          <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-primary)', marginBottom: '0.4rem' }}>
            {file ? file.name : t.dragDropText}
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB ${lang === 'hi' ? 'चुना गया' : 'selected'}` : t.supportedFormats}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>CBC (Hemogram)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Lipid (Cholesterol)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>LFT (Liver)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>KFT (Kidney)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Thyroid (TSH)</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Vitamin D / B12</span>
          </div>
        </div>

        {/* Upload Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px', fontWeight: 700 }}
          >
            {uploading ? (lang === 'hi' ? 'रिपोर्ट पढ़ी जा रही है...' : 'Extracting Lab Values...') : t.uploadButton}
          </button>

          <button
            type="button"
            onClick={handleLoadSampleReport}
            disabled={uploading}
            className="btn btn-secondary btn-lg"
            style={{ fontWeight: 600 }}
            title="Instantly inject a pre-configured multi-panel report for demonstration"
          >
            ⚡ {t.sampleButton}
          </button>
        </div>
      </div>

      {/* 3-Step Simple Guide for All Age Groups */}
      <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '1.25rem' }}>
          💡 {t.howItWorksTitle}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: '#FAFBF8', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤</div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
              {t.step1Title}
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
              {t.step1Desc}
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#FAFBF8', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
              {t.step2Title}
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
              {t.step2Desc}
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#FAFBF8', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
              {t.step3Title}
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
              {t.step3Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
