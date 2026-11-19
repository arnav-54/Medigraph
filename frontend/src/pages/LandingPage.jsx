import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';

export function LandingPage() {
  const { lang, t, languages } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);
  const currentLangObj = languages.find(l => l.code === lang) || { native: 'English', name: 'English' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      <LanguageSelectorModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        padding: '1.25rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#0D9488',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
          }}>
            MG
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#0F172A' }}>
              MediGraph AI
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {t.brandTagline || 'Personal Health Intelligence & Report Tracker'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Multi-language Selector */}
          <button
            onClick={() => setLangModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              backgroundColor: '#F8FAFC',
              borderColor: '#CBD5E1',
              color: '#0F172A'
            }}
            title="Select Language / भाषा चुनें"
          >
            <span>🌐</span>
            <span>{currentLangObj.native}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>▼</span>
          </button>

          <Link to="/login" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
            {t.signInBtn || 'Sign In'}
          </Link>
          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, backgroundColor: '#0D9488', borderColor: '#0F766E' }}
          >
            {t.enterDemo || '⚡ Instant Demo'}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 2rem', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0F766E',
              backgroundColor: '#F0FDFA',
              border: '1px solid #99F6E4',
              padding: '0.4rem 0.95rem',
              borderRadius: '9999px',
              marginBottom: '1.5rem'
            }}>
              <span className="live-indicator" /> SMART LAB REPORT INTELLIGENCE
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              marginBottom: '1.25rem'
            }}>
              Your Medical History, Decoded & Tracked in Simple Words.
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#334155',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: '540px'
            }}>
              Never lose track of your health. Upload blood tests, thyroid checks, and doctor reports from any Indian lab. MediGraph automatically extracts your values, explains what they mean, and graphs your improvements over time.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.85rem',
                  fontSize: '1rem',
                  backgroundColor: '#0D9488',
                  borderColor: '#0F766E'
                }}
              >
                {t.enterDemo || '⚡ Explore Demo (Jane Doe)'}
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}
              >
                {t.uploadButton || 'Upload Your Report →'}
              </Link>
            </div>

            {/* Supported Labs Badge */}
            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                Works with reports from:
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['Dr Lal PathLabs', 'Thyrocare', 'SRL Diagnostics', 'Apollo 24|7', 'Max Healthcare'].map((lab, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    color: '#334155'
                  }}>
                    {lab}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Specimen Preview Card */}
          <div className="card" style={{
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                  Metropolitan Health Checkup
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Patient: Jane Doe · 15 Nov 2026
                </div>
              </div>
              <span className="status-pill status-pill-normal">
                ✓ Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Hemoglobin', val: '14.2 g/dL', range: '12.0 - 16.0', status: 'normal', label: '✓ Normal' },
                { name: 'Fasting Blood Glucose', val: '118 mg/dL', range: '70 - 99', status: 'elevated', label: '⚠️ Elevated' },
                { name: 'HbA1c (3-Month Sugar)', val: '5.9 %', range: '4.0 - 5.6', status: 'elevated', label: '⚠️ Elevated' },
                { name: 'Serum Creatinine (Kidney)', val: '0.95 mg/dL', range: '0.60 - 1.20', status: 'normal', label: '✓ Normal' },
                { name: 'Total Cholesterol', val: '210 mg/dL', range: '< 200', status: 'elevated', label: '⚠️ Elevated' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: item.status === 'elevated' ? '#FFFBEB' : '#F8FAFC',
                  border: item.status === 'elevated' ? '1px solid #FDE68A' : '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      Safe Range: [{item.range}]
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: item.status === 'elevated' ? '#92400E' : '#0F172A' }}>
                      {item.val}
                    </div>
                    <span className={`status-pill status-pill-${item.status}`} style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700 }}>
                💡 23 Biomarkers Tracked Across 5 Years
              </span>
              <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D9488' }}>
                Open Trajectories →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.75rem',
          marginTop: '2rem'
        }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📖</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              Biomarker Dictionary
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Look up any medical test in 11 Indian languages. Learn what it tests, why doctors order it, normal safe ranges, and diet tips.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📈</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              Lifetime Health Curves
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Compare values across 1, 3, or 5 years. Standardized units make sure graphs accurately reflect your true biological trajectory.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
              Grounded AI Assistant
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Ask questions in Hindi, English, Bengali, Tamil, or Telugu. Answers cite source document pages with zero hallucinations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748B',
        lineHeight: 1.6
      }}>
        <div>
          <strong>MediGraph AI</strong> · Personal Health Document Intelligence Platform.
        </div>
        <div style={{ marginTop: '0.35rem' }}>
          Disclaimer: This application is for educational and personal health organization purposes. It does not provide medical diagnoses or treatment recommendations. Always consult a qualified physician.
        </div>
      </footer>
    </div>
  );
}
