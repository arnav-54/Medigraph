import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export function SummariesPage() {
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
      setError(err.message || 'Failed to generate summary. Ensure at least one report is uploaded.');
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
        alert('Summary edits saved successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to save edits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Longitudinal Health Summaries</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Editable, provenance-backed longitudinal overviews across verified medical records
          </p>
        </div>
        <button onClick={handleGenerate} className="btn btn-primary" disabled={generating}>
          {generating ? 'Generating Summary...' : '+ Generate New Summary'}
        </button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Summaries List */}
        <div className="card" style={{ width: '320px', padding: '1rem', minHeight: '400px' }}>
          <h2 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Generated Reports</h2>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading summaries...</div>
          ) : summaries.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
              No summaries generated yet. Click <strong>Generate New Summary</strong> to synthesize your reports.
            </div>
          ) : (
            summaries.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedSummary(s);
                  setEditText(s.summaryText);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: s.id === selectedSummary?.id ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {new Date(s.createdAt).toLocaleDateString()} {s.isUserEdited && '• Edited by User'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Summary Detail & Editor */}
        <div className="card" style={{ flex: 1, padding: '1.5rem' }}>
          {selectedSummary ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedSummary.title}</h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Created on {new Date(selectedSummary.createdAt).toLocaleString()}
                    {selectedSummary.isUserEdited && <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>User Edited</span>}
                  </div>
                </div>
                <button onClick={handleSaveEdit} className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Corrections'}
                </button>
              </div>

              <div className="alert alert-info" style={{ fontSize: '0.8125rem', padding: '0.75rem 1rem' }}>
                <span>🤖</span>
                <span><strong>AI-Generated Summary:</strong> Review values below. You may directly edit this report to annotate or correct clinical details.</span>
              </div>

              <textarea
                className="form-input"
                rows={18}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a summary on the left or generate a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
