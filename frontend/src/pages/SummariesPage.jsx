import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export function SummariesPage() {
  const { t, lang } = useLanguage();
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummaries = async () => {
    try {
      const res = await api.get('/api/v1/summaries');
      if (res.success && res.data?.summaries) {
        setSummaries(res.data.summaries);
        if (res.data.summaries.length > 0 && !selectedSummary) {
          setSelectedSummary(res.data.summaries[0]);
          setEditText(res.data.summaries[0].summaryText);
        }
      }
    } catch (err) {
      console.error('Failed to load summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/api/v1/summaries', {});
      if (res.success && res.data?.summary) {
        setSummaries(prev => [res.data.summary, ...prev]);
        setSelectedSummary(res.data.summary);
        setEditText(res.data.summary.summaryText);
      }
    } catch (err) {
      setError(err.message || 'Failed to synthesize summary. Please ensure at least one document is uploaded.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSummary) return;
    setSaving(true);
    try {
      const res = await api.patch(`/api/v1/summaries/${selectedSummary.id}`, {
        summaryText: editText
      });
      if (res.success && res.data?.summary) {
        setSelectedSummary(res.data.summary);
        fetchSummaries();
        alert(lang === 'hi' ? 'सारांश सफलतापूर्वक सहेजा गया' : 'Health summary saved successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to save summary corrections');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header Deck */}
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
                {lang === 'hi' ? 'डॉक्टर सारांश रिपोर्ट' : 'DOCTOR-READY HEALTH BRIEFING'}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.875rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)',
              lineHeight: 1.15
            }}>
              {t.summariesTitle || 'Doctor-Ready Health Summaries'}
            </h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '0.35rem', maxWidth: '680px' }}>
              {t.summariesSubtitle || 'Plain-language medical summary across all your tests to show your physician or family.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary"
              style={{ backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
            >
              {generating
                ? (lang === 'hi' ? 'सारांश तैयार हो रहा है...' : 'Synthesizing Summary...')
                : (t.generateSummary || '+ Generate New Health Summary')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Split Deck Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Left Column: Monograph Index */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--hairline)',
            backgroundColor: '#FAFBF8',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#4B5563',
            textTransform: 'uppercase'
          }}>
            {lang === 'hi' ? `तैयार किए गए सारांश (${summaries.length})` : `SAVED SUMMARIES (${summaries.length})`}
          </div>

          <div style={{ padding: '0.75rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-muted)', fontSize: '0.8rem' }}>
                {lang === 'hi' ? 'लोड हो रहा है...' : 'Loading summaries...'}
              </div>
            ) : summaries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📄</div>
                <p style={{ fontSize: '0.825rem', color: 'var(--ink-secondary)', marginBottom: '1rem' }}>
                  {t.noSummariesYet || 'No summaries generated yet. Click "+ Generate New Health Summary" to synthesize your records.'}
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', backgroundColor: '#0F5132' }}
                >
                  {lang === 'hi' ? 'सारांश बनाएं' : 'Generate Now'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {summaries.map(s => {
                  const isSelected = s.id === selectedSummary?.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSummary(s);
                        setEditText(s.summaryText);
                      }}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                        border: '1px solid',
                        borderColor: isSelected ? '#BBF7D0' : 'var(--hairline)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: isSelected ? '#0F5132' : 'var(--ink-primary)'
                      }}>
                        {s.title || (lang === 'hi' ? 'स्वास्थ्य सारांश रिपोर्ट' : 'Health Summary Briefing')}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.72rem', color: '#6B7280' }}>
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        {s.isUserEdited && (
                          <span style={{ color: '#0F5132', fontWeight: 600 }}>{lang === 'hi' ? 'सुधारा हुआ' : 'EDITED'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monograph Document Editor */}
        <div className="card" style={{ padding: '2rem' }}>
          {selectedSummary ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--hairline)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {selectedSummary.title || (lang === 'hi' ? 'स्वास्थ्य सारांश' : 'Longitudinal Health Summary')}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                    {lang === 'hi' ? 'तैयार किया गया:' : 'Generated on'} {new Date(selectedSummary.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSaveEdit}
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                    style={{ backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
                  >
                    {saving ? (lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...') : (t.saveSummary || 'Save Corrections')}
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: '#F8FAF9',
                border: '1px solid #D5DFDA',
                borderRadius: '6px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.825rem',
                color: '#374151',
                lineHeight: 1.5
              }}>
                <strong>💡 {lang === 'hi' ? 'डॉक्टर के लिए निर्देश:' : 'Physician Briefing:'}</strong>{' '}
                {t.summaryDisclaimer || 'This summary is generated from your verified reports to help you communicate with your physician.'}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {lang === 'hi' ? 'सारांश का विवरण (आप इसे एडिट कर सकते हैं):' : 'Summary Narrative (Editable):'}
                </label>
                <textarea
                  className="form-textarea"
                  style={{
                    minHeight: '340px',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB'
                  }}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
                {lang === 'hi' ? 'कोई सारांश नहीं चुना गया' : 'No Summary Selected'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {t.noSummariesYet || 'Select a summary on the left or generate a new one from your uploaded reports.'}
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn btn-primary"
                style={{ backgroundColor: '#0F5132' }}
              >
                {t.generateSummary || '+ Generate New Health Summary'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
