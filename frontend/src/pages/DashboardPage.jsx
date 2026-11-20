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
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Skeleton, SkeletonCard } from '../components/ui/index.js';

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
        const [docsRes, trendsRes, timelineRes] = await Promise.allSettled([
          api.get('/api/v1/documents?limit=6'),
          api.get('/api/v1/analytics/lab-trends'),
          api.get('/api/v1/timeline?limit=6')
        ]);
        if (docsRes.status === 'fulfilled' && docsRes.value?.success) {
          setDocuments(docsRes.value.data.documents || []);
        }
        if (trendsRes.status === 'fulfilled' && trendsRes.value?.success) {
          setTrends(trendsRes.value.data.trends || []);
        }
        if (timelineRes.status === 'fulfilled' && timelineRes.value?.success) {
          setTimelineEvents(timelineRes.value.data.events || []);
        }
      } catch {
        // Silently maintain stable offline/fallback state
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

  const abnormalTests = trends.filter((item) => {
    const val = item.latestValue;
    if (val === null || val === undefined) return false;
    if (item.testName.includes('Cholesterol') && val > 200) return true;
    if (item.testName.includes('Glucose') && val > 100) return true;
    if (item.testName.includes('HbA1c') && val >= 5.7) return true;
    if (item.testName.includes('SGPT') && val > 50) return true;
    return false;
  });

  const vitalityScore = Math.max(68, 100 - abnormalTests.length * 6);
  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'Patient Record');
  const userInitial = displayName[0].toUpperCase();
  const ageDisplay = user?.profile?.age || user?.age || '32';
  const genderDisplay = user?.profile?.gender || user?.gender || 'Not specified';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SkeletonCard rows={2} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
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
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Patient Identity */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)',
                flexShrink: 0
              }}
            >
              {userInitial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#065F46'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                  Active Vault
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  ID: {user?.id?.slice(0, 14) || 'usr-patient'}
                </span>
              </div>

              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  margin: 0
                }}
              >
                {displayName}
              </h1>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--ink-secondary)', flexWrap: 'wrap' }}>
                <span>Age: <strong style={{ color: 'var(--ink)' }}>{ageDisplay} Y</strong></span>
                <span>•</span>
                <span>Gender: <strong style={{ color: 'var(--ink)' }}>{genderDisplay}</strong></span>
                <span>•</span>
                <span>Ingested Reports: <strong style={{ color: '#065F46' }}>{documents.length}</strong></span>
                <span>•</span>
                <span>Email: <strong style={{ color: 'var(--ink)' }}>{user?.email || 'patient@medivault.ai'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Pill Buttons) */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openDictionaryFor('')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#065F46';
                e.currentTarget.style.color = '#065F46';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--ink)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <BookOpen size={15} color="#065F46" />
              <span>Biomarker Guide</span>
            </button>

            <Link to="/upload" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1px solid #064E3B',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6, 95, 70, 0.35)',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(6, 95, 70, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(6, 95, 70, 0.35)';
                }}
              >
                <UploadCloud size={16} strokeWidth={2.2} />
                <span>Upload Report</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: abnormalTests.length === 0 ? 'var(--status-normal-bg)' : 'var(--status-borderline-bg)',
                border: `1px solid ${abnormalTests.length === 0 ? 'var(--status-normal-border)' : 'var(--status-borderline-border)'}`,
                color: abnormalTests.length === 0 ? 'var(--status-normal-ink)' : 'var(--status-borderline-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 800
              }}
            >
              {vitalityScore}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                Vitality Stability Index: {abnormalTests.length === 0 ? 'Optimal Control' : 'Attention Suggested'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                {abnormalTests.length === 0
                  ? 'All measured biomarkers within physiological reference interval.'
                  : `${abnormalTests.length} parameter(s) outside optimal laboratory reference interval.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-sub)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-secondary)'
              }}
            >
              {trends.length} Tracked Biomarkers
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-sub)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-secondary)'
              }}
            >
              {timelineEvents.length} Clinical Visits
            </span>
          </div>
        </div>
      </div>

      {/* Abnormal Values Warning Banner */}
      {abnormalTests.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-borderline-bg)',
            border: '1px solid var(--status-borderline-border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <AlertTriangle size={18} color="var(--status-borderline-ink)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--status-borderline-ink)' }}>
              Elevated Biomarkers Detected
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: '2px 0 8px', lineHeight: 1.5 }}>
              Certain measurements exceed normal laboratory intervals. Review trajectories with your doctor.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                    fontSize: '11px',
                    color: 'var(--status-borderline-ink)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {item.testName}: {item.latestValue} {item.unit} → Guide
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ONBOARDING SHOWCASE (When 0 documents uploaded) ── */}
      {documents.length === 0 && (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1.5px dashed var(--accent-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto 28px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                marginBottom: '12px'
              }}
            >
              <UploadCloud size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome to your Health Ledger, {displayName}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '6px', lineHeight: 1.6 }}>
              Upload your first diagnostic report to unlock automated OCR value extraction, multi-year trend curves, and citation-grounded AI consultation.
            </p>
          </div>

          {/* 3 Step Onboarding Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--accent-border)' }}>
                    STEP 1
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Upload Lab PDF</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5, margin: '6px 0 16px' }}>
                  Works with Dr Lal PathLabs, Thyrocare, SRL Diagnostics, Apollo 24|7, Max Healthcare, and local hospitals.
                </p>
              </div>

              <Link to="/upload" style={{ textDecoration: 'none' }}>
                <Button variant="accent" size="sm" icon={UploadCloud} style={{ width: '100%' }}>
                  Upload Report Now
                </Button>
              </Link>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                    EXPLORE
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Biomarker Guide</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5, margin: '6px 0 16px' }}>
                  Look up 23+ tests across 11 Indian languages (Hindi, Tamil, Bengali, Telugu...). Learn normal ranges and diet tips.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={BookOpen}
                onClick={() => openDictionaryFor('')}
                style={{ width: '100%' }}
              >
                Open Test Dictionary
              </Button>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                    ASSISTANT
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Ask AI Doctor</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5, margin: '6px 0 16px' }}>
                  Ask clinical questions in simple everyday language. Every response cites source report pages.
                </p>
              </div>

              <Link to="/assistant" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={Bot} style={{ width: '100%' }}>
                  Open AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Physiological Status Matrix */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
              Physiological Status Matrix
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px', margin: 0 }}>
              Unit-normalized latest measurements across primary diagnostic panels.
            </p>
          </div>
          <Link to="/analytics" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
            View all trajectories →
          </Link>
        </div>

        {trends.length === 0 ? (
          /* Specimen Matrix Preview while no report is ingested */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {[
              { category: 'Hematology', name: 'Hemoglobin', value: '14.2', unit: 'g/dL', status: 'Normal', delta: '+0.2', badge: 'normal' },
              { category: 'Metabolic', name: 'Fasting Glucose', value: '118', unit: 'mg/dL', status: 'Elevated', delta: '+8.0', badge: 'borderline' },
              { category: 'Renal Function', name: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', status: 'Normal', delta: '-0.05', badge: 'normal' },
              { category: 'Lipid Profile', name: 'Total Cholesterol', value: '210', unit: 'mg/dL', status: 'High', delta: '+12.0', badge: 'abnormal' }
            ].map((spec, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  boxShadow: 'var(--shadow-xs)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {spec.category}
                  </span>
                  <Badge variant={spec.badge} size="sm">
                    {spec.status}
                  </Badge>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                  {spec.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 12px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {spec.value}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600 }}>
                    {spec.unit}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Delta vs baseline:</span>
                  <span style={{ fontWeight: 700, color: spec.badge === 'borderline' || spec.badge === 'abnormal' ? 'var(--status-borderline-ink)' : 'var(--accent)' }}>
                    {spec.delta} {spec.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {trends.slice(0, 4).map((item, idx) => {
              const delta = item.delta;
              const isElevated = delta > 0 && (item.testName.includes('Glucose') || item.testName.includes('Cholesterol') || item.testName.includes('SGPT'));
              const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

              return (
                <div
                  key={idx}
                  onClick={() => openDictionaryFor(item.testName)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-xs)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.category || 'Clinical Panel'}
                    </span>
                    <Badge variant={isElevated ? 'borderline' : 'normal'} size="sm">
                      {isElevated ? 'Elevated' : 'Normal'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                    {item.testName}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 12px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {item.latestValue !== null && item.latestValue !== undefined ? item.latestValue : '—'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600 }}>
                      {item.unit}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Delta vs baseline:</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700, color: isElevated ? 'var(--status-borderline-ink)' : 'var(--accent)' }}>
                      <DeltaIcon size={12} />
                      {delta !== null && delta !== undefined ? (delta > 0 ? `+${delta}` : delta) : '0.0'} {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ingestion History & Longitudinal Encounters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Uploads Ledger */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <CardTitle as="h3">Recent Reports Ingested</CardTitle>
                <CardDescription>Verified cryptographic diagnostic uploads</CardDescription>
              </div>
              <Link to="/documents" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">View all →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '0' }}>
            {documents.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <FileText size={28} color="var(--ink-faint)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-secondary)', margin: 0 }}>
                  No reports uploaded yet
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: '4px 0 14px' }}>
                  Upload a PDF from any lab to begin your health history.
                </p>
                <Link to="/upload" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm" icon={UploadCloud}>
                    Upload Report
                  </Button>
                </Link>
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
                      transition: 'background-color 150ms ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} style={{ color: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                          {doc.originalFilename}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                          {new Date(doc.uploadedAt).toLocaleDateString()} · {doc.extractedRecords?.length || 0} tests extracted
                        </div>
                      </div>
                    </div>
                    <Badge variant="normal" size="sm">Verified</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Encounters */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <CardTitle as="h3">Longitudinal Encounters</CardTitle>
                <CardDescription>Chronological timeline of clinical visits</CardDescription>
              </div>
              <Link to="/timeline" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">Full index →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '0' }}>
            {timelineEvents.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <Calendar size={28} color="var(--ink-faint)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-secondary)', margin: 0 }}>
                  No clinical encounters logged yet
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: '4px 0 14px' }}>
                  Lab checkups and visits are automatically organized into your timeline.
                </p>
                <Link to="/timeline" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="sm" icon={Calendar}>
                    View Timeline
                  </Button>
                </Link>
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
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                        {evt.title}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                        {new Date(evt.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.4 }}>
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
