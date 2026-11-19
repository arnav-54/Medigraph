import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, FileText, Check, Save, Printer, Calendar, Shield } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, SkeletonCard, EmptyState, Alert } from '../components/ui';

export function SummariesPage() {
  const { lang, t } = useLanguage();
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      setError(err.message || 'Failed to synthesize summary. Ensure at least one report is uploaded.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSummary) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await api.patch(`/api/v1/summaries/${selectedSummary.id}`, {
        summaryText: editText
      });
      if (res.success && res.data?.summary) {
        setSelectedSummary(res.data.summary);
        fetchSummaries();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save summary modifications');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Deck */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Doctor-Ready Health Briefings
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Multi-document medical synthesis in plain language formatted for family physicians and clinical visits.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          loading={generating}
          onClick={handleGenerate}
        >
          Generate New Briefing
        </Button>
      </div>

      {error && (
        <Alert variant="critical" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {savedSuccess && (
        <Alert variant="success" onClose={() => setSavedSuccess(false)}>
          Health briefing updated and saved to vault.
        </Alert>
      )}

      {/* Split Deck Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '16px', alignItems: 'flex-start' }}>
        {/* Left Column: Index of Summaries */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">Saved Briefings ({summaries.length})</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '12px' }}>
                <Skeleton width="100%" height="40px" />
                <Skeleton width="100%" height="40px" style={{ marginTop: '8px' }} />
              </div>
            ) : summaries.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                No briefings generated yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {summaries.map((s) => {
                  const isSelected = selectedSummary?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedSummary(s); setEditText(s.summaryText); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--surface-sub)' : 'transparent',
                        border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: isSelected ? 600 : 500, color: 'var(--ink)' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        {new Date(s.createdAt).toLocaleDateString()} · {s.documentsIncluded?.length || 0} reports
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Briefing Editor / Viewer */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle as="h3">{selectedSummary?.title || 'Clinical Health Briefing'}</CardTitle>
              <CardDescription>
                {selectedSummary ? `Generated ${new Date(selectedSummary.createdAt).toLocaleDateString()}` : 'Select or generate a briefing'}
              </CardDescription>
            </div>

            {selectedSummary && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
                  Print
                </Button>
                <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSaveEdit}>
                  Save Notes
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {!selectedSummary ? (
              <div style={{ padding: '48px 0' }}>
                <EmptyState
                  icon={ClipboardList}
                  title="No Briefing Selected"
                  description="Generate a multi-document synthesis to create a 1-page health briefing for your physician."
                  action={
                    <Button variant="primary" size="sm" icon={Plus} loading={generating} onClick={handleGenerate}>
                      Generate Now
                    </Button>
                  }
                />
              </div>
            ) : (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '420px',
                    padding: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    lineHeight: '1.6',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface-sub)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    resize: 'vertical'
                  }}
                />

                <div style={{ marginTop: '12px', fontSize: 'var(--text-2xs)', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                  Educational synthesis for doctor appointments. Does not substitute professional clinical diagnosis.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
