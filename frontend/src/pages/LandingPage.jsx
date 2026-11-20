import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Globe,
  UploadCloud,
  CheckCircle,
  Star,
  ChevronRight,
  Activity,
  Lock,
  Zap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';
import { BrandLogo } from '../components/BrandLogo.jsx';

/* ─────────────── Inline design tokens ─────────────────── */
const C = {
  ink:     '#111827',
  ink2:    '#374151',
  ink3:    '#6B7280',
  ink4:    '#9CA3AF',
  surface: '#FFFFFF',
  canvas:  '#F9FAFB',
  border:  '#E5E7EB',
  accent:  '#0D9488',
  accentH: '#0F766E',
  accentS: '#F0FDFA',
  accentB: '#99F6E4',
  dark:    '#0A1628',
};

/* ─────────────── Reusable tiny components ──────────────── */
function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 9999,
      background: C.accentS, border: `1px solid ${C.accentB}`,
      fontSize: 12, fontWeight: 600, color: C.accentH,
      letterSpacing: '0.03em', textTransform: 'uppercase'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
      {children}
    </span>
  );
}

function NavBtn({ children, to, variant = 'ghost' }) {
  const isAccent = variant === 'accent';
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 18px', borderRadius: 8, fontWeight: 600,
      fontSize: 14, textDecoration: 'none', transition: 'all 150ms ease',
      background: isAccent ? C.accent : 'transparent',
      color: isAccent ? '#fff' : C.ink2,
      border: isAccent ? `1px solid ${C.accentH}` : '1px solid transparent',
    }}>
      {children}
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, body, photo, photoAlt }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column'
    }}>
      {photo && (
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img
            src={photo}
            alt={photoAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
          }} />
        </div>
      )}
      <div style={{ padding: '24px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: C.accentS, border: `1px solid ${C.accentB}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, color: C.accent
        }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: C.ink3, lineHeight: 1.65 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function StatBadge({ value, label }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
      border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '12px 18px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: 12, color: C.ink3, marginTop: 1 }}>{label}</div>
    </div>
  );
}

/* ─────────────── Main Page ─────────────────────────────── */
export function LandingPage() {
  const { lang, t, languages } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);
  const currentLangObj = languages.find(l => l.code === lang) || { native: 'English' };

  const labLogos = ['Dr Lal PathLabs', 'Thyrocare', 'SRL Diagnostics', 'Apollo 24|7', 'Max Healthcare', 'Metropolis'];

  const reviews = [
    { name: 'Priya Sharma', role: 'Patient, Delhi', text: 'Finally I can see my sugar trends across 3 years in one place. The AI assistant explained my HbA1c better than any brochure.', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80' },
    { name: 'Rohit Mehta', role: 'Patient, Mumbai', text: 'Uploaded my Thyrocare report and within seconds I had all my values organized. The doctor briefing feature is incredible.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
    { name: 'Anita Nair', role: 'Patient, Bangalore', text: 'The 11-language support is a game changer. My mother can now read her own lab reports in Malayalam.', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: 'var(--font-sans)' }}>
      <LanguageSelectorModal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} />

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size="md" />
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <NavBtn to="/login">Features</NavBtn>
            <NavBtn to="/login">Security</NavBtn>
            <button
              onClick={() => setLangModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: C.ink3 }}
            >
              <Globe size={15} />
              {currentLangObj.native}
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NavBtn to="/login">Sign In</NavBtn>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8,
              background: C.ink, color: '#fff',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'background 150ms ease'
            }}>
              Get Started Free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ background: C.canvas, paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            {/* Left text */}
            <div>
              <Pill>Smart Lab Report Intelligence</Pill>

              <h1 style={{
                marginTop: 20, marginBottom: 20,
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 800, lineHeight: 1.1,
                letterSpacing: '-0.04em', color: C.ink
              }}>
                Your health story,<br />
                <span style={{ color: C.accent }}>told in numbers</span><br />
                you understand.
              </h1>

              <p style={{ fontSize: 17, color: C.ink2, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
                Upload any lab report from Dr Lal, Thyrocare, Apollo, or any Indian diagnostic lab. MediVault reads it, tracks your biomarkers over time, and answers your questions in plain language.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', borderRadius: 10,
                  background: C.accent, color: '#fff',
                  fontWeight: 700, fontSize: 16, textDecoration: 'none',
                  boxShadow: `0 4px 16px rgba(13,148,136,0.35)`,
                  transition: 'all 150ms ease'
                }}>
                  <UploadCloud size={18} />
                  Upload Your Report — Free
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', borderRadius: 10,
                  background: C.surface, color: C.ink,
                  fontWeight: 600, fontSize: 16, textDecoration: 'none',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}>
                  View Demo <ChevronRight size={16} />
                </Link>
              </div>

              {/* Trust bar */}
              <div>
                <p style={{ fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
                  Works with all major Indian labs
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {labLogos.map(lab => (
                    <span key={lab} style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: C.surface, border: `1px solid ${C.border}`,
                      fontSize: 12, color: C.ink3, fontWeight: 500
                    }}>
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Hero Photo */}
            <div style={{ position: 'relative' }}>
              {/* Main photo */}
              <div style={{
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                aspectRatio: '4/3', position: 'relative'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85"
                  alt="Doctor reviewing digital health records on tablet"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(13,148,136,0.15) 0%, transparent 60%)'
                }} />
              </div>

              {/* Floating stat cards */}
              <div style={{ position: 'absolute', bottom: -20, left: -20 }}>
                <StatBadge value="23+" label="Biomarkers tracked" />
              </div>
              <div style={{ position: 'absolute', top: 20, right: -20 }}>
                <StatBadge value="11" label="Indian languages" />
              </div>
              <div style={{ position: 'absolute', top: '50%', right: -16, transform: 'translateY(-50%)' }}>
                <div style={{
                  background: '#ECFDF5', border: '1px solid #A7F3D0',
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}>
                  <CheckCircle size={18} color="#065F46" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Hemoglobin Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────── */}
      <section style={{ background: C.ink, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {[
            { n: '50,000+', l: 'Reports Processed' },
            { n: '98.4%', l: 'Extraction Accuracy' },
            { n: '11', l: 'Indian Languages Supported' },
            { n: '100%', l: 'Private & Encrypted' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: C.canvas }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Pill>Simple & Fast</Pill>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>
              From PDF to insights in 30 seconds
            </h2>
            <p style={{ fontSize: 16, color: C.ink3, marginTop: 10, maxWidth: 520, margin: '12px auto 0' }}>
              No complex forms, no manual data entry. Just upload and we handle the rest.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                step: '01',
                title: 'Upload Your Lab PDF',
                body: 'Drag and drop any lab report — blood test, thyroid panel, lipid profile — from any Indian diagnostic center.',
                photo: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
              },
              {
                step: '02',
                title: 'AI Reads & Extracts',
                body: 'Our medical OCR engine reads every value, unit, and reference range with 98%+ accuracy. Zero manual entry needed.',
                photo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80',
              },
              {
                step: '03',
                title: 'Track & Understand',
                body: 'View multi-year biomarker curves, ask our AI assistant questions in Hindi or English, and generate doctor briefings.',
                photo: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=600&q=80',
              },
            ].map(item => (
              <div key={item.step} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease, box-shadow 200ms ease'
              }}>
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.photo}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px', borderRadius: 9999,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em'
                    }}>
                      STEP {item.step}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.ink3, lineHeight: 1.65 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.surface }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Pill>What You Get</Pill>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>
              Everything your health records need
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <FeatureCard
              icon={TrendingUp}
              title="Lifetime Biomarker Curves"
              body="See how your glucose, cholesterol, hemoglobin, and 20+ other markers have changed across 1, 3, or 5 years. All in one clean chart."
              photo="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
              photoAlt="Health data analytics chart"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Ask in Any Indian Language"
              body="Query your records in Hindi, Bengali, Tamil, Telugu, Marathi, or 6 more languages. Get clear answers grounded in your actual reports."
              photo="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80"
              photoAlt="Doctor patient consultation"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Complete Privacy & Control"
              body="Your records are encrypted and isolated. Download your full archive (GDPR Art. 20) or permanently erase everything in one click."
              photo="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
              photoAlt="Data security and privacy"
            />
            <FeatureCard
              icon={Globe}
              title="Biomarker Dictionary"
              body="Every test explained in plain language across 11 regional languages. Normal ranges, what it tests, why doctors order it, and diet tips."
              photo="https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=600&q=80"
              photoAlt="Medical reference books"
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.canvas }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Pill>Patient Stories</Pill>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>
              People who finally understand their health
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {reviews.map(r => (
              <div key={r.name} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={C.accent} color={C.accent} />)}
                </div>
                <p style={{ fontSize: 15, color: C.ink2, lineHeight: 1.65, marginBottom: 20 }}>
                  "{r.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={r.photo}
                    alt={r.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.border}` }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: C.ink4 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LARGE PHOTO BREAK ──────────────────────────────── */}
      <section style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=85"
          alt="Medical professional working with health data"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.5) 60%, rgba(10,22,40,0.2) 100%)',
          display: 'flex', alignItems: 'center'
        }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 48px', width: '100%' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              The MediVault Promise
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 800,
              color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15,
              maxWidth: 560, marginBottom: 24
            }}>
              Medical history is not a stack of unread PDFs.
            </h2>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 10,
              background: C.accent, color: '#fff',
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(13,148,136,0.4)`
            }}>
              Start Your Health Ledger <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: C.ink }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 20 }}>
            <Zap size={14} color={C.accent} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Free to use. No credit card required.</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 20 }}>
            Take control of your health today
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 36 }}>
            Upload your first lab report in under a minute. Understand what your body is telling you, track it over time, and walk into your doctor's office prepared.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10,
              background: C.accent, color: '#fff',
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(13,148,136,0.5)`
            }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 24px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600, fontSize: 16, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              Enter Demo Sandbox
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: '#050D1A', padding: '48px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
            <BrandLogo size="md" light />
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Use', 'Security', 'Contact'].map(l => (
                <Link key={l} to="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 MediVault. All rights reserved.</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 480 }}>
              Not a diagnostic or medical device. Always consult a licensed physician for diagnosis or treatment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
