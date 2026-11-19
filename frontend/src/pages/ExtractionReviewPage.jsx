import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';

export function ExtractionReviewPage() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ rawValue: '', rawUnit: '', referenceRangeRaw: '' });
  const [dictionaryBiomarker, setDictionaryBiomarker] = useState(null);

  const fetchExtractions = async () => {
    try {
      const res = await api.get(`/api/v1/documents/${id}/extractions`);
      if (res.success) {
        setExtractions(res.data.extractions || []);
        return res.data.extractions || [];
      }
    } catch (err) {
      setError(err.message || 'Failed to load extracted lab results');
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    let intervalId = null;

    async function initialLoadAndPoll() {
      const items = await fetchExtractions();
      if (items.length === 0 && pollingCount < 5) {
        intervalId = setTimeout(() => {
          setPollingCount(prev => prev + 1);
        }, 1800);
      }
    }

    initialLoadAndPoll();
    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [id, pollingCount]);

  const handleVerify = async (extractionId) => {
    try {
      await api.post(`/api/v1/extractions/${extractionId}/verify`);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleVerifyAll = async () => {
    try {
      await api.post(`/api/v1/documents/${id}/verify-all`);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Bulk verification failed');
    }
  };

  const startEdit = (record) => {
    const lab = record.labResults?.[0];
    setEditingRecord(record);
    setEditForm({
      rawValue: lab ? lab.rawValue : '',
      rawUnit: lab ? lab.rawUnit : '',
      referenceRangeRaw: lab ? (lab.referenceRangeRaw || '') : ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/v1/extractions/${editingRecord.id}`, editForm);
      setEditingRecord(null);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Failed to update record');
    }
  };

  const verifiedCount = extractions.filter(r => r.verificationStatus === 'VERIFIED').length;
  const pendingCount = extractions.length - verifiedCount;

  return (
    <div>
      {/* Verification Header Deck */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-press)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
                <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
                {lang === 'hi' ? 'लैब रिपोर्ट जांच' : 'CLINICAL LAB VERIFICATION'}
              </span>
              <span className="status-pill status-pill-neutral">DOC ID: {id?.slice(0, 12)}</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.875rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)',
              lineHeight: 1.15
            }}>
              {t.reviewTitle || 'Verify Extracted Lab Readings'}
            </h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '0.35rem', maxWidth: '680px' }}>
              {t.reviewSubtitle || 'Review the values read from your report before they are permanently added to your health graphs.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--ink-secondary)',
              padding: '0.5rem 0.85rem',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-subtle)'
            }}>
              <strong style={{ color: '#15803D' }}>{verifiedCount} {t.verified}</strong> · <strong style={{ color: '#854D0E' }}>{pendingCount} {t.pending}</strong>
            </div>

            <button
              onClick={handleVerifyAll}
              disabled={extractions.length === 0}
              className="btn btn-primary"
              style={{ backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
            >
              ✓ {t.verifyAll || 'Verify All'} ({extractions.length})
            </button>

            <Link to={`/documents/${id}`} className="btn btn-secondary">
              {lang === 'hi' ? 'रिपोर्ट विवरण' : 'Report Details'}
            </Link>
          </div>
        </div>
      </div>

      {/* Friendly Guide Callout */}
      <div style={{
        backgroundColor: '#F8FAF9',
        border: '1px solid #D5DFDA',
        borderLeft: '4px solid #0F5132',
        padding: '1.25rem 1.5rem',
        borderRadius: '6px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          backgroundColor: '#E6F4EA',
          color: '#0F5132',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          💡
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.2rem' }}>
            {lang === 'hi' ? 'सटीक रीडिंग व डिक्शनरी गाइड' : 'Precision Extraction & Test Guide'}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#4B5563', lineHeight: 1.55 }}>
            {lang === 'hi'
              ? 'MediGraph AI आपके डॉक्टर और लैब की रिपोर्ट से वैल्यूज निकालता है। यदि किसी टेस्ट का अर्थ समझना हो, तो उसके सामने "📖 टेस्ट गाइड" बटन दबाएं। आप किसी भी संख्या को गलत होने पर एडिट भी कर सकते हैं।'
              : 'MediGraph AI parses every measurement and safety interval from your uploaded PDF. Click the "📖 Guide" button beside any test to learn why it matters and what normal values are. You can also edit any value to correct it.'}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(18, 24, 36, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 'var(--radius-card)',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-float)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  {lang === 'hi' ? 'वैल्यू सुधारें' : 'MANUAL CORRECTION'}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {editingRecord.labResults?.[0]?.testNameRaw || 'Biomarker'}
                </h3>
              </div>
              <span className="status-pill status-pill-neutral">AUDIT LOGGED</span>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {lang === 'hi' ? 'संख्यात्मक मान (Value)' : 'Observed Value'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}
                  value={editForm.rawValue}
                  onChange={(e) => setEditForm({ ...editForm, rawValue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {lang === 'hi' ? 'माप की इकाई (Unit)' : 'Unit (e.g. mg/dL, g/dL)'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={editForm.rawUnit}
                  onChange={(e) => setEditForm({ ...editForm, rawUnit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {lang === 'hi' ? 'लैब की सामान्य सीमा (Reference Range)' : 'Lab Reference Interval'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={editForm.referenceRangeRaw}
                  onChange={(e) => setEditForm({ ...editForm, referenceRangeRaw: e.target.value })}
                  placeholder="e.g. 70 - 99, 13.0 - 17.0"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn btn-secondary"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0F5132' }}>
                  {t.save || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Measurements Table */}
      <div className="clinical-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FAFBF8'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
              {lang === 'hi' ? `निकाले गए टेस्ट परिणाम (${extractions.length})` : `Extracted Laboratory Measurements (${extractions.length})`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
              {lang === 'hi' ? 'सत्यापित होने पर यह टेस्ट आपके स्वास्थ्य ग्राफ में जुड़ जाएंगे' : 'Validated measurements are incorporated into your health graphs and timelines'}
            </div>
          </div>

          {loading && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0F5132', fontWeight: 600 }}>
              {lang === 'hi' ? 'रिपोर्ट पढ़ी जा रही है...' : 'READING DOCUMENT...'}
            </span>
          )}
        </div>

        {loading && extractions.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontWeight: 600, color: 'var(--ink-primary)', fontSize: '1.1rem' }}>
              {lang === 'hi' ? 'एआई रिपोर्ट से टेस्ट वैल्यूज निकाल रहा है...' : 'Reading PDF text layers and extracting biomarkers...'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
              {lang === 'hi' ? 'कृपया कुछ सेकंड प्रतीक्षा करें...' : 'Results will appear here automatically.'}
            </div>
          </div>
        ) : extractions.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
              {lang === 'hi' ? 'कोई टेस्ट नहीं मिला' : 'No Structured Measurements Extracted'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', maxWidth: '440px', margin: '0.5rem auto 1.5rem' }}>
              {lang === 'hi' ? 'फाइल अभी प्रोसेस हो रही हो सकती है या पेज साफ नहीं है। पुनः जांचें।' : 'The ingestion queue may still be processing pages. Click re-scan to refresh.'}
            </p>
            <button onClick={() => fetchExtractions()} className="btn btn-primary" style={{ backgroundColor: '#0F5132' }}>
              ↻ {lang === 'hi' ? 'फिर से जांचें' : 'Re-Scan Specimen Deck'}
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>{lang === 'hi' ? 'टेस्ट का नाम व जानकारी' : 'Biomarker / Test Name'}</th>
                  <th style={{ width: '15%' }}>{lang === 'hi' ? 'रीडिंग (Value)' : 'Observed Result'}</th>
                  <th style={{ width: '15%' }}>{lang === 'hi' ? 'सामान्य सुरक्षित सीमा' : 'Reference Range'}</th>
                  <th style={{ width: '12%' }}>{lang === 'hi' ? 'मूल्यांकन' : 'Evaluation'}</th>
                  <th style={{ width: '15%' }}>{lang === 'hi' ? 'सटीकता' : 'OCR Confidence'}</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>{lang === 'hi' ? 'कार्यवाही' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {extractions.map((record) => {
                  const lab = record.labResults?.[0];
                  const testName = lab?.testNameRaw || 'Uncategorized Biomarker';
                  const canonicalName = lab?.labTest?.canonicalName || testName;
                  const value = lab ? lab.rawValue : '-';
                  const unit = lab?.rawUnit || '';
                  const range = lab?.referenceRangeRaw || 'Standard Interval';
                  const isAbnormal = lab?.isAbnormalFlag;
                  const isCritical = lab?.isCriticalFlag;
                  const isVerified = record.verificationStatus === 'VERIFIED';
                  const isEdited = record.verificationStatus === 'EDITED';
                  const conf = Math.round((record.extractionConfidence || 0.95) * 100);

                  return (
                    <tr key={record.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--ink-primary)' }}>
                            {testName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDictionaryBiomarker(canonicalName)}
                            style={{
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.68rem',
                              borderRadius: '4px',
                              border: '1px solid #D1D5DB',
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              cursor: 'pointer'
                            }}
                            title="Open Test Guide & Info"
                          >
                            📖 {lang === 'hi' ? 'गाइड' : 'Info'}
                          </button>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
                          Page {record.pageNumber || 1} · {lab?.labTest?.category || 'Clinical Panel'}
                        </div>
                      </td>
                      <td>
                        <span className="val-bold" style={{
                          color: isCritical ? '#991B1B' : isAbnormal ? '#854D0E' : 'var(--ink-primary)',
                          fontSize: '1rem'
                        }}>
                          {value}
                        </span>
                        <span className="val-unit" style={{ marginLeft: '0.3rem', fontSize: '0.8rem', color: '#6B7280' }}>
                          {unit}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#4B5563' }}>
                          [{range}]
                        </span>
                      </td>
                      <td>
                        {isCritical ? (
                          <span className="status-pill status-pill-critical" style={{ fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                            🚨 {t.critical}
                          </span>
                        ) : isAbnormal ? (
                          <span className="status-pill status-pill-elevated" style={{ fontSize: '0.72rem' }}>
                            ⚠️ {t.elevated}
                          </span>
                        ) : (
                          <span className="status-pill status-pill-normal" style={{ fontSize: '0.72rem' }}>
                            ✓ {t.normal}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {conf >= 85 ? (
                            <span style={{
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px'
                            }}>
                              {conf}% {lang === 'hi' ? 'उच्च' : 'High'}
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px'
                            }}>
                              ⚠️ {conf}% {lang === 'hi' ? 'जांचें' : 'Review'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {isVerified ? (
                            <span className="status-pill status-pill-normal" style={{ fontSize: '0.72rem' }}>
                              ✓ {t.verified}
                            </span>
                          ) : isEdited ? (
                            <span className="status-pill status-pill-neutral" style={{ fontSize: '0.72rem' }}>
                              ✏️ {lang === 'hi' ? 'सुधारा गया' : 'Edited'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerify(record.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#15803D', fontWeight: 600 }}
                            >
                              ✓ {lang === 'hi' ? 'पुष्टि करें' : 'Verify'}
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(record)}
                            className="btn btn-secondary btn-sm"
                          >
                            ✏️ {lang === 'hi' ? 'बदलें' : 'Edit'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dictionary Modal for direct in-place explanation */}
      {dictionaryBiomarker && (
        <BiomarkerDictionaryModal
          initialBiomarker={dictionaryBiomarker}
          onClose={() => setDictionaryBiomarker(null)}
        />
      )}
    </div>
  );
}
