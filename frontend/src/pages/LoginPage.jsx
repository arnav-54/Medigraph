import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, TrendingUp, MessageSquare, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';
import { BrandLogo } from '../components/BrandLogo.jsx';
import { Activity } from 'lucide-react';

const C = {
  ink:     '#111827',
  ink2:    '#374151',
  ink3:    '#6B7280',
  ink4:    '#9CA3AF',
  surface: '#FFFFFF',
  canvas:  '#F9FAFB',
  border:  '#E5E7EB',
  borderF: '#0D9488',
  accent:  '#0D9488',
  accentH: '#0F766E',
  accentS: '#F0FDFA',
  error:   '#DC2626',
  errorBg: '#FEF2F2',
  errorB:  '#FECACA',
  dark:    '#0A1628',
};

function FormInput({ label, type = 'text', icon: Icon, value, onChange, placeholder, required, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.ink2 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.ink4, display: 'flex', pointerEvents: 'none' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%', height: 44,
            padding: Icon ? '0 40px 0 40px' : '0 14px',
            borderRadius: 8, fontSize: 14, color: C.ink,
            background: C.surface,
            border: `1.5px solid ${error ? C.errorB : C.border}`,
            outline: 'none', transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontFamily: 'inherit'
          }}
          onFocus={e => { e.target.style.borderColor = C.borderF; e.target.style.boxShadow = `0 0 0 3px rgba(13,148,136,0.12)`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.errorB : C.border; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.ink4, display: 'flex', padding: 0 }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: C.error }}>{error}</p>}
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const { login } = useAuth();
  const { lang, t, languages } = useLanguage();
  const navigate = useNavigate();
  const currentLang = languages.find(l => l.code === lang) || { native: 'English' };

  const doLogin = async (e, pw) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(e ? email : 'patient.demo@medigraph.ai', e ? password : (pw || 'DemoPassword123!'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, text: 'Biomarker trends across 5+ years' },
    { icon: MessageSquare, text: 'AI assistant in 11 Indian languages' },
    { icon: ShieldCheck, text: 'Private, encrypted, yours to delete' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)' }}>
      <LanguageSelectorModal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} />

      {/* ── LEFT PANEL (Photo + Brand) ─────────────────────── */}
      <div style={{
        flex: '0 0 55%', position: 'relative', overflow: 'hidden',
        display: 'none',
        background: C.dark,
      }} className="login-left-panel">
        {/* Full-height background photo */}
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85"
          alt="Medical professional reviewing health data"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(10,22,40,0.75) 100%)'
        }} />

        {/* Content on top of photo */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', padding: '48px 56px' }}>
          {/* Logo */}
          <div>
            <BrandLogo size="md" light />
          </div>

          {/* Center content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Health Record Intelligence
            </p>
            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 800, color: '#fff',
              letterSpacing: '-0.04em', lineHeight: 1.15,
              marginBottom: 20
            }}>
              Your health story,<br />
              <span style={{ color: '#5EEAD4' }}>beautifully organized.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 400, marginBottom: 40 }}>
              Upload lab reports from any Indian diagnostic lab. We track your biomarkers, explain your results, and help you have better doctor conversations.
            </p>

            {/* Feature bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {features.map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(13,148,136,0.2)', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={16} color="#5EEAD4" />
                  </div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "Medical history is not a stack of unread PDFs. It is a continuous physiological ledger."
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ─────────────────────────────── */}
      <div style={{
        flex: 1, background: C.canvas,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', minHeight: '100vh',
        overflowY: 'auto'
      }}>
        {/* Top bar on small screens */}
        <div style={{
          position: 'absolute', top: 20, right: 20,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <button
            onClick={() => setLangModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: C.ink3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Globe size={14} /> {currentLang.native}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile / Form logo */}
          <div style={{ marginBottom: 28 }}>
            <BrandLogo size="md" />
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: C.ink3, marginBottom: 28 }}>
            Sign in to your health vault or{' '}
            <button
              onClick={() => doLogin(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontWeight: 600, fontSize: 14, padding: 0, fontFamily: 'inherit' }}
            >
              try the demo →
            </button>
          </p>

          {/* Demo shortcut card */}
          <div
            onClick={() => doLogin(null)}
            style={{
              padding: '14px 18px', borderRadius: 10, marginBottom: 24,
              background: C.accentS, border: `1.5px solid ${C.accentH}20`,
              cursor: 'pointer', transition: 'all 150ms ease',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accentH }}>Try Instant Demo</div>
              <div style={{ fontSize: 12, color: C.ink3, marginTop: 1 }}>Explore biomarker graphs & AI assistant immediately</div>
            </div>
            <ArrowRight size={16} color={C.accent} />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.ink4, fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: C.errorBg, border: `1px solid ${C.errorB}`, marginBottom: 20, fontSize: 13, color: C.error, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={15} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormInput
              label="Email address"
              type="email"
              icon={Mail}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <FormInput
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 46, borderRadius: 10, marginTop: 4,
                background: loading ? '#6B7280' : C.ink,
                color: '#fff', fontWeight: 700, fontSize: 15,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 150ms ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontFamily: 'inherit'
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 600ms linear infinite', display: 'inline-block' }} />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: C.ink3 }}>
              New here?{' '}
              <Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
                Create account
              </Link>
            </p>
            <Link to="/register" style={{ fontSize: 13, color: C.ink4, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {/* Trust badge */}
          <div style={{ marginTop: 32, padding: '12px 16px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color={C.ink3} />
            <p style={{ fontSize: 11, color: C.ink4, lineHeight: 1.5 }}>
              <strong style={{ color: C.ink3 }}>Zero data brokers.</strong> Your records stay yours. Encrypted, isolated, deletable at any time.
            </p>
          </div>
        </div>
      </div>

      {/* ── Spinner keyframe ───────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
