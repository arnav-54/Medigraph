import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  FileUp,
  LineChart,
  Bot,
  ClipboardList,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  AlertTriangle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Skeleton, SkeletonCard, EmptyState, Alert } from '../components/ui';

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

  const abnormalTests = trends.filter(item => {
    const val = item.latestValue;
    if (val === null || val === undefined) return false;
    if (item.testName.includes('Cholesterol') && val > 200) return true;
    if (item.testName.includes('Glucose') && val > 100) return true;
    if (item.testName.includes('HbA1c') && val >= 5.7) return true;
    if (item.testName.includes('SGPT') && val > 50) return true;
    return false;
  });

  const vitalityScore = Math.max(68, 100 - (abnormalTests.length * 6));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SkeletonCard rows={2} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
        </div>
        <SkeletonCard rows={4} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
        initialSearch={dictionarySearch}
      />

      {/* Patient Dossier Masthead */}
      <Card>
        <CardContent style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Badge variant="accent" size="sm">Active Vault</Badge>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>ID: {user?.id?.slice(0, 16) || 'usr-patient'}</span>
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {user?.fullName || user?.email?.split('@')[0] || 'Patient Record'}
              </h1>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                <span>Age: <strong>41 Y</strong></span>
                <span>•</span>
                <span>Sex: <strong>Female</strong></span>
                <span>•</span>
                <span>Reports Ingested: <strong>{documents.length}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => openDictionaryFor('')}>
                Biomarker Guide
              </Button>
              <Link to="/upload">
                <Button variant="primary" size="sm" icon={FileUp}>
                  Upload Report
                </Button>
              </Link>
            </div>
          </div>

          {/* Vitality Index Bar */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: abnormalTests.length === 0 ? 'var(--status-normal-bg)' : 'var(--status-borderline-bg)',
                border: `1px solid ${abnormalTests.length === 0 ? 'var(--status-normal-border)' : 'var(--status-borderline-border)'}`,
                color: abnormalTests.length === 0 ? 'var(--status-normal-ink)' : 'var(--status-borderline-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                fontWeight: 600
              }}>
                {vitalityScore}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}>
                  Vitality Stability Index: {abnormalTests.length === 0 ? 'Good Control' : 'Attention Suggested'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                  {abnormalTests.length} parameter(s) outside optimal laboratory reference interval
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="neutral" size="sm">{trends.length} Tracked Biomarkers</Badge>
              <Badge variant="neutral" size="sm">{timelineEvents.length} Clinical Visits</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abnormal Values Banner if present */}
      {abnormalTests.length > 0 && (
        <Alert
          variant="warning"
          title="Elevated Biomarkers Detected"
          action={
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {abnormalTests.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openDictionaryFor(item.testName)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--status-borderline-border)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--status-borderline-ink)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {item.testName}: <strong>{item.latestValue} {item.unit}</strong> → Guide
                </button>
              ))}
            </div>
          }
        >
          Certain observations exceed standard clinical ranges. Review trends with your physician.
        </Alert>
      )}

      {/* Biomarker Status Matrix Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>
              Physiological Status Matrix
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Unit-normalized latest measurements across primary diagnostic panels.
            </p>
          </div>
          <Link to="/analytics" style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--accent)' }}>
            View all trajectories →
          </Link>
        </div>

        {trends.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No biomarker measurements found"
            description="Upload your first laboratory report PDF or photo to extract and graph your biomarkers."
            action={
              <Link to="/upload">
                <Button variant="primary" size="sm" icon={FileUp}>Upload Report</Button>
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {trends.slice(0, 4).map((item, idx) => {
              const delta = item.delta;
              const isElevated = delta > 0 && (item.testName.includes('Glucose') || item.testName.includes('Cholesterol') || item.testName.includes('SGPT'));
              const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

              return (
                <Card
                  key={idx}
                  hover
                  style={{ cursor: 'pointer' }}
                  onClick={() => openDictionaryFor(item.testName)}
                >
                  <CardContent style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.category || 'Clinical Panel'}
                      </span>
                      <Badge variant={isElevated ? 'borderline' : 'normal'} size="sm">
                        {isElevated ? 'Elevated' : 'Normal'}
                      </Badge>
                    </div>

                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                      {item.testName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 14px' }}>
                      <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {item.latestValue !== null && item.latestValue !== undefined ? item.latestValue : '—'}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', fontWeight: 500 }}>
                        {item.unit}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--ink-muted)' }}>Delta vs baseline:</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600, color: isElevated ? 'var(--status-borderline-ink)' : 'var(--ink)' }}>
                        <DeltaIcon size={12} />
                        {delta !== null && delta !== undefined ? (delta > 0 ? `+${delta}` : delta) : '0.0'} {item.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ingestion History & Longitudinal Visits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Uploads Ledger */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle as="h3">Recent Reports Ingested</CardTitle>
              <CardDescription>Verified cryptographic diagnostic uploads</CardDescription>
            </div>
            <Link to="/documents">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent style={{ padding: '0' }}>
            {documents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                No diagnostic documents uploaded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {documents.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} style={{ color: 'var(--ink-muted)' }} />
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--ink)' }}>
                          {doc.originalFilename}
                        </div>
                        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                          {new Date(doc.uploadedAt).toLocaleDateString()} · {doc.extractedRecords?.length || 0} extracted items
                        </div>
                      </div>
                    </div>
                    <Badge variant="normal" size="sm">Ready</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Encounters */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle as="h3">Longitudinal Encounters</CardTitle>
              <CardDescription>Chronological timeline of clinical visits</CardDescription>
            </div>
            <Link to="/timeline">
              <Button variant="ghost" size="sm">Full index</Button>
            </Link>
          </CardHeader>
          <CardContent style={{ padding: '0' }}>
            {timelineEvents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                No clinical encounters logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {timelineEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--ink)' }}>
                        {evt.title}
                      </span>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                        {new Date(evt.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', lineHeight: 'var(--leading-xs)' }}>
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
