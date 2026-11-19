import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Globe,
  UploadCloud,
  FileCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';
import { Button, Badge } from '../components/ui/index.js';

export function LandingPage() {
  const { lang, t, languages } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);
  const currentLangObj = languages.find((l) => l.code === lang) || { native: 'English', name: 'English' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--ink-primary)', display: 'flex', flexDirection: 'column' }}>
      <LanguageSelectorModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.875rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Activity size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span
              style={{
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-base)',
                letterSpacing: '-0.02em',
                color: 'var(--ink-primary)'
              }}
            >
              MediVault
            </span>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-muted)',
                marginLeft: 'var(--space-2)',
                display: 'none',
                verticalAlign: 'middle'
              }}
              className="brand-subtitle"
            >
              Clinical Records
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Multi-language Selector */}
          <Button
            variant="ghost"
            size="sm"
            icon={Globe}
            onClick={() => setLangModalOpen(true)}
            title="Select Language / भाषा चुनें"
          >
            <span>{currentLangObj.native}</span>
            <ChevronDown size={14} style={{ opacity: 0.6 }} />
          </Button>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              {t.signInBtn || 'Sign In'}
            </Button>
          </Link>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" icon={ArrowRight}>
              {t.enterDemo || 'Explore Demo'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1180px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)', width: '100%' }}>
        {/* Hero Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-10)',
            alignItems: 'center',
            marginBottom: 'var(--space-16)'
          }}
        >
          {/* Left Column: Calm Value Proposition */}
          <div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Badge variant="accent" icon={ShieldCheck}>
                Longitudinal Health Ledger
              </Badge>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
                fontWeight: 'var(--weight-semibold)',
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
                color: 'var(--ink-primary)',
                margin: 0,
                marginBottom: 'var(--space-4)'
              }}
            >
              Medical history is not a stack of unread PDFs. It is a continuous physiological ledger.
            </h1>

            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--ink-secondary)',
                lineHeight: 1.65,
                margin: 0,
                marginBottom: 'var(--space-6)',
                maxWidth: '520px'
              }}
            >
              Upload laboratory reports from any diagnostic provider. MediVault extracts clinical biomarkers, standardizes measurement units across years, maps physiological trajectories, and equips you with a grounded assistant for doctor visits.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  {t.enterDemo || 'Open Patient Workspace'}
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" icon={UploadCloud}>
                  {t.uploadButton || 'Upload Laboratory PDF'}
                </Button>
              </Link>
            </div>

            {/* Supported Providers in calm monochrome */}
            <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Engineered for Indian Diagnostic Formats
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {['Dr Lal PathLabs', 'Thyrocare', 'SRL Diagnostics', 'Apollo 24|7', 'Max Healthcare', 'Metropolis'].map((lab) => (
                  <span
                    key={lab}
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--ink-secondary)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {lab}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Specimen Clinical Record Preview */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink-primary)' }}>
                  Metropolitan Health Panel
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                  Specimen ID: LAB-2026-9481 · 15 Nov 2026
                </div>
              </div>
              <Badge variant="normal" icon={CheckCircle2}>
                Verified Extraction
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '12.0 – 16.0', variant: 'normal', status: 'Normal' },
                { name: 'Fasting Blood Glucose', value: '118', unit: 'mg/dL', range: '70 – 99', variant: 'borderline', status: 'Elevated' },
                { name: 'HbA1c (Glycated Hemoglobin)', value: '5.9', unit: '%', range: '4.0 – 5.6', variant: 'borderline', status: 'Elevated' },
                { name: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', range: '0.60 – 1.20', variant: 'normal', status: 'Normal' },
                { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '< 200', variant: 'abnormal', status: 'High' }
              ].map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink-primary)' }}>
                      {row.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginTop: '2px' }}>
                      Ref: {row.range} {row.unit}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {row.value}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginLeft: '3px' }}>
                        {row.unit}
                      </span>
                    </div>
                    <Badge variant={row.variant} size="sm">
                      {row.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <TrendingUp size={14} color="var(--color-accent)" /> 23 biomarkers tracked across 5 years
              </span>
              <Link to="/login" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 'var(--weight-medium)' }}>
                View Trajectories →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Pillars Grid */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: '-0.02em',
                color: 'var(--ink-primary)',
                margin: 0,
                marginBottom: 'var(--space-2)'
              }}
            >
              A calm, structured foundation for personal health
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', margin: 0 }}>
              Precision medical parsing, multi-year trend normalization, and local-first data ownership.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-primary)'
                }}
              >
                <TrendingUp size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', margin: 0, color: 'var(--ink-primary)' }}>
                Longitudinal Curves
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                Automatic unit standardization ensures glucose, lipid profiles, and renal biomarkers are plotted accurately across 1, 3, or 5-year spans.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-primary)'
                }}
              >
                <MessageSquare size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', margin: 0, color: 'var(--ink-primary)' }}>
                Grounded Assistant
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                Query your health record in plain natural language or 11 Indian languages. Every response provides optical citations to source report pages.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-primary)'
                }}
              >
                <Globe size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', margin: 0, color: 'var(--ink-primary)' }}>
                Biomarker Dictionary
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                Understand what each clinical test means, why physicians evaluate it, and how lifestyle factors influence baseline physiological values.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-primary)'
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', margin: 0, color: 'var(--ink-primary)' }}>
                Complete Sovereignty
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                Strict tenant isolation. Export your entire medical record in structured JSON (GDPR Art. 20) or permanently erase files in a single click.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-8) var(--space-6)',
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-muted)',
          lineHeight: 1.6
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ color: 'var(--ink-secondary)', fontWeight: 'var(--weight-medium)' }}>
            MediVault · Longitudinal Health Intelligence Platform
          </div>
          <div>
            Disclaimer: MediVault is an archival, tracking, and educational platform for personal health records. It does not provide medical diagnoses, treatment advice, or replace consultation with licensed medical practitioners.
          </div>
        </div>
      </footer>
    </div>
  );
}
