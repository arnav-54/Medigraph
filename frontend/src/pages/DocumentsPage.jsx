import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export function DocumentsPage() {
  const { t, lang } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/api/v1/documents${query}`);
      if (res.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [statusFilter]);

  const filtered = documents.filter(doc =>
    doc.originalFilename.toLowerCase().includes(search.toLowerCase()) ||
    (doc.sha256Checksum && doc.sha256Checksum.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
              <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
              {lang === 'hi' ? 'दस्तावेज़ आर्काइव' : 'DOCUMENT ARCHIVE'}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--ink-primary)',
            marginBottom: '0.35rem'
          }}>
            {t.docsTitle || 'My Medical Records & Lab Reports'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
            {t.docsSubtitle || 'All your uploaded lab reports, blood panels, and checkup PDFs in one safe place.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchDocs}
            className="btn btn-secondary"
            title="Refresh document library"
          >
            <span>↻</span> {t.refresh}
          </button>
          <Link
            to="/upload"
            className="btn btn-primary"
            style={{ fontWeight: 600, backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
          >
            <span>+</span> {t.upload}
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t.searchDocs || 'Search reports by file name...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <span style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-faint)',
              fontSize: '0.9rem'
            }}>
              🔍
            </span>
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t.allStatus || 'All Statuses'}</option>
              <option value="QUEUED">{lang === 'hi' ? 'कतार में' : 'Queued'}</option>
              <option value="PROCESSING">{lang === 'hi' ? 'प्रोसेसिंग जारी' : 'Processing'}</option>
              <option value="REVIEW_REQUIRED">{lang === 'hi' ? 'जांच आवश्यक' : 'Review Required'}</option>
              <option value="COMPLETED">{lang === 'hi' ? 'सफलतापूर्वक पूर्ण' : 'Completed'}</option>
              <option value="FAILED">{lang === 'hi' ? 'असफल' : 'Failed'}</option>
            </select>
          </div>

          <div style={{
            fontSize: '0.8rem',
            color: 'var(--ink-muted)',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '6px',
            border: '1px solid var(--hairline)'
          }}>
            {filtered.length} {lang === 'hi' ? 'रिपोर्ट्स' : (filtered.length === 1 ? 'REPORT' : 'REPORTS')}
          </div>
        </div>
      </div>

      {/* Documents Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⏳</div>
            <div>{lang === 'hi' ? 'रिपोर्ट्स लोड हो रही हैं...' : 'Loading document archive...'}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.25rem',
              color: 'var(--ink-muted)'
            }}>
              📁
            </div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
              {lang === 'hi' ? 'कोई रिपोर्ट नहीं मिली' : 'No Documents Found'}
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
              {lang === 'hi' ? 'अपनी पहली मेडिकल रिपोर्ट अपलोड करें।' : 'Upload your first clinical report or reset the active filter.'}
            </p>
            <Link to="/upload" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0F5132' }}>
              {t.upload}
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>{t.docName || 'Report Name'}</th>
                  <th style={{ width: '16%' }}>{t.uploadDate || 'Upload Date'}</th>
                  <th style={{ width: '10%' }}>{t.pagesCount || 'Pages'}</th>
                  <th style={{ width: '14%' }}>{t.extractedTests || 'Extracted Tests'}</th>
                  <th style={{ width: '12%' }}>{t.docStatus || 'Status'}</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>{t.docActions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '4px',
                          backgroundColor: '#EBF3FA',
                          border: '1px solid #BFD7EE',
                          color: '#0D3E6B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          PDF
                        </div>
                        <div>
                          <Link
                            to={`/documents/${doc.id}`}
                            style={{
                              fontWeight: 600,
                              color: 'var(--ink-primary)',
                              fontSize: '0.9rem'
                            }}
                          >
                            {doc.originalFilename}
                          </Link>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginTop: '0.2rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            color: 'var(--ink-muted)'
                          }}>
                            <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                        {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {doc.pageCount || 1} {lang === 'hi' ? 'पेज' : 'pg'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.925rem',
                          color: (doc._count?.extractedRecords || 0) > 0 ? '#0F5132' : 'var(--ink-muted)'
                        }}>
                          {doc._count?.extractedRecords || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{lang === 'hi' ? 'टेस्ट' : 'tests'}</span>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={doc.processingStatus} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/documents/${doc.id}/extractions`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                          title="Audit extracted laboratory findings"
                        >
                          {t.inspectTests || 'Inspect Tests'} ({doc._count?.extractedRecords || 0})
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem 1.5rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid var(--hairline)',
        borderLeft: '4px solid #0F5132',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '1.25rem' }}>🛡️</span>
        <div>
          <div style={{
            fontSize: '0.825rem',
            fontWeight: 700,
            color: '#0F5132',
            marginBottom: '0.25rem'
          }}>
            {lang === 'hi' ? 'पूर्ण गोपनीयता व सुरक्षित आर्काइव' : 'Confidentiality & Cryptographic Storage'}
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            {lang === 'hi'
              ? 'आपकी सभी रिपोर्ट्स आपके कंप्यूटर पर सुरक्षित एन्क्रिप्टेड हैं। कोई भी अनधिकृत व्यक्ति या बाहरी सेवा आपकी मेडिकल रिपोर्ट्स नहीं पढ़ सकती।'
              : 'Every uploaded report is cryptographically hashed and isolated to your secure local session. MediGraph AI prevents duplicate records and anchors every test value to its source PDF page.'}
          </p>
        </div>
      </div>
    </div>
  );
}
