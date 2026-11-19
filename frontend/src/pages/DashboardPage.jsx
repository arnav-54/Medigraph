import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, trendsRes, timelineRes] = await Promise.all([
          api.get('/api/v1/documents?limit=6'),
          api.get('/api/v1/analytics/lab-trends'),
          api.get('/api/v1/timeline?limit=6')
        ]);
        if (docsRes.success) setDocuments(docsRes.data.documents || []);
        if (trendsRes.success) setTrends(trendsRes.data.trends || []);
        if (timelineRes.success) setTimelineEvents(timelineRes.data.events || []);
      } catch (err) {
        console.error('Error loading ledger data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openDictionaryFor = (testName) => {
    setDictionarySearch(testName || '');
    setDictionaryOpen(true);
  };

  // Detect any tests with elevated, low, or critical values
  const abnormalTests = trends.filter(t => {
    const val = t.statistics?.latestValue;
    if (val === null || val === undefined) return false;
    if (t.testName.includes('Cholesterol') && val > 200) return true;
    if (t.testName.includes('Triglycerides') && val > 150) return true;
    if (t.testName.includes('Glucose') && val > 100) return true;
    if (t.testName.includes('SGPT') && val > 50) return true;
    if (t.testName.includes('SGOT') && val > 40) return true;
    if (t.testName.includes('Uric Acid') && val > 7.0) return true;
    if (t.testName.includes('HbA1c') && val >= 5.7) return true;
    if (t.testName.includes('Vitamin D') && val < 30) return true;
    if (t.testName.includes('Vitamin B12') && val < 210) return true;
    return false;
  });

  // Calculate simple Vitality Health Score (100 minus penalty for each abnormal test)
  const healthScore = Math.max(68, 100 - (abnormalTests.length * 5));

  return (
    <div>
      {/* Test Guide Modal */}
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
        initialSearch={dictionarySearch}
      />

      {/* Patient Dossier Masthead */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem 2rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-press)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="specimen-tag">
                <span className="live-indicator" /> {t.patientDossier} · 1985-04-12
              </span>
              <span className="status-pill status-pill-normal">{t.verifiedRecord}</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.85rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)',
              lineHeight: 1.2
            }}>
              {user?.fullName || 'Jane Doe'}
            </h1>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
              <span>AGE: <strong>41 Y</strong></span>
              <span>•</span>
              <span>SEX: <strong>FEMALE</strong></span>
              <span>•</span>
              <span>IDENTIFIER: <strong>{user?.id?.slice(0, 18) || 'usr-demo-patient'}</strong></span>
              <span>•</span>
              <span>REPORTS INGESTED: <strong>{documents.length}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Quick Dictionary Button */}
            <button
              onClick={() => openDictionaryFor('')}
              className="btn btn-secondary"
              style={{ fontWeight: 600, fontSize: '0.85rem' }}
            >
              <span>📖</span> {lang === 'hi' ? 'टेस्ट डिक्शनरी' : 'Test Dictionary'}
            </button>
            <Link to="/upload" className="btn btn-primary" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              <span>+</span> {t.upload}
            </Link>
            <Link to="/assistant" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <span>💬</span> {t.navAssistant}
            </Link>
            <Link to="/summaries" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <span>📄</span> {t.navSummaries}
            </Link>
          </div>
        </div>

        {/* Vitality Summary Bar */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: healthScore >= 80 ? '#EDF7F1' : '#FEF9C3',
              border: `2px solid ${healthScore >= 80 ? '#BBF7D0' : '#FDE047'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              color: healthScore >= 80 ? '#14532D' : '#854D0E'
            }}>
              {healthScore}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink-primary)' }}>
                {t.vitalityScore}: <span style={{ color: healthScore >= 80 ? '#15803D' : '#854D0E' }}>{healthScore >= 80 ? (lang === 'hi' ? 'संतोषजनक (Good Control)' : 'Good Stability') : (lang === 'hi' ? 'ध्यान देने योग्य (Attention Needed)' : 'Needs Monitoring')}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {t.vitalityDesc} · {abnormalTests.length} {lang === 'hi' ? 'पैरामीटर्स में ध्यान देने की जरूरत है' : 'readings outside standard reference ranges'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
              🔬 {trends.length} {lang === 'hi' ? 'बायोमार्कर्स ट्रैक हो रहे हैं' : 'Tracked Biomarkers'}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
              📅 {timelineEvents.length} {lang === 'hi' ? 'स्वास्थ्य माइलस्टोन्स' : 'Health Visits'}
            </span>
          </div>
        </div>
      </div>

      {/* Critical / Elevated Alert Banner (If abnormal values exist) */}
      {abnormalTests.length > 0 && (
        <div style={{
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderLeft: '4px solid #EA580C',
          borderRadius: 'var(--radius-subtle)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-press)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.35rem', marginTop: '1px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#9A3412', marginBottom: '0.35rem' }}>
                {t.criticalAlertTitle}
              </div>
              <p style={{ fontSize: '0.825rem', color: '#7C2D12', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {t.criticalAlertMessage}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {abnormalTests.map((tItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => openDictionaryFor(tItem.testName)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FED7AA',
                      borderRadius: 'var(--radius-sharp)',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#9A3412',
                      cursor: 'pointer'
                    }}
                    title="Click to learn what this test means"
                  >
                    <span>{tItem.testName}:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{tItem.statistics?.latestValue ?? tItem.latestValue} {tItem.unit}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#C2410C' }}>📖 Info →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Health Indicators Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-primary)' }}>
              {t.statusMatrixTitle}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {t.statusMatrixSubtitle} · {lang === 'hi' ? 'जानकारी के लिए किसी भी कार्ड पर क्लिक करें' : 'Click any card to learn why it matters'}
            </div>
          </div>
          <Link to="/analytics" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
            {t.viewAllTrends}
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {trends.slice(0, 4).map((tItem, idx) => {
            const val = tItem.statistics?.latestValue ?? tItem.latestValue;
            const delta = tItem.statistics?.delta ?? tItem.delta;
            const isElevated = delta > 0 && (tItem.testName.includes('Glucose') || tItem.testName.includes('Cholesterol') || tItem.testName.includes('SGPT'));

            return (
              <div
                key={idx}
                onClick={() => openDictionaryFor(tItem.testName)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-press)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--cobalt-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-raised)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'var(--shadow-press)'; }}
                title={lang === 'hi' ? 'इस टेस्ट की पूरी जानकारी और डाइट टिप्स देखें' : 'Click to learn definition, normal range and diet tips'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {tItem.category || 'CLINICAL PANEL'}
                  </div>
                  <span className={`status-pill ${isElevated ? 'status-pill-elevated' : 'status-pill-normal'}`}>
                    {isElevated ? t.elevated : t.normal}
                  </span>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{tItem.testName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cobalt)' }}>📖</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                      {val !== null && val !== undefined ? val : '—'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                      {tItem.unit}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem'
                }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.deltaVsBaseline}</span>
                  <strong style={{ color: delta > 0 ? '#854D0E' : 'var(--ink-primary)' }}>
                    {delta !== null && delta !== undefined ? (delta > 0 ? `+${delta}` : delta) : '0.0'} {tItem.unit}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Ingestion Ledger & Chronological Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Document Ingestion Ledger */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                {t.recentReports}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--ink-muted)' }}>
                {lang === 'hi' ? 'सत्यापित और सुरक्षित मेडिकल रिपोर्ट्स' : 'Cryptographically verified PDF uploads'}
              </p>
            </div>
            <Link to="/documents" className="btn btn-secondary btn-sm">
              {lang === 'hi' ? 'सभी देखें' : 'All Records'} ({documents.length})
            </Link>
          </div>

          {documents.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
              <div>{lang === 'hi' ? 'अभी तक कोई रिपोर्ट अपलोड नहीं हुई।' : 'No reports ingested yet.'}</div>
              <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                {t.upload}
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>{lang === 'hi' ? 'रिपोर्ट फ़ाइल' : 'Report Title'}</th>
                    <th>{lang === 'hi' ? 'तारीख' : 'Upload Date'}</th>
                    <th>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <Link to={`/documents/${doc.id}`} style={{ fontWeight: 600, color: 'var(--ink-primary)', fontSize: '0.85rem' }}>
                          {doc.originalFilename}
                        </Link>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                          {(doc.fileSize / 1024).toFixed(1)} KB · {doc._count?.extractedRecords || 0} {lang === 'hi' ? 'टेस्ट' : 'markers'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.785rem' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <StatusBadge status={doc.processingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chronological Longitudinal Encounters */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                {t.recentTimeline}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--ink-muted)' }}>
                {lang === 'hi' ? 'तारीख-वार मेडिकल हिस्ट्री' : 'Sequential calendar history of visits'}
              </p>
            </div>
            <Link to="/timeline" className="btn btn-secondary btn-sm">
              {lang === 'hi' ? 'पूरी टाइमलाइन' : 'Full Index'} →
            </Link>
          </div>

          {timelineEvents.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <div>{lang === 'hi' ? 'कोई टाइमलाइन इवेंट नहीं मिला।' : 'No timeline events recorded yet.'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {timelineEvents.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#FAFBF8',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink-primary)' }}>
                      {evt.title}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {new Date(evt.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  {evt.description && (
                    <p style={{ fontSize: '0.785rem', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
