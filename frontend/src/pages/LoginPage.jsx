import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('patient.demo@medigraph.ai');
  const [password, setPassword] = useState('DemoPassword123!');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const { login } = useAuth();
  const { t, lang, languages } = useLanguage();
  const navigate = useNavigate();
  const currentLangObj = languages.find(l => l.code === lang) || { native: 'English', name: 'English' };

  const handlePerformLogin = async (userEmail, userPassword) => {
    setError(null);
    setLoading(true);

    try {
      await login(userEmail, userPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePerformLogin(email, password);
  };

  const handleInstantDemo = () => {
    setEmail('patient.demo@medigraph.ai');
    setPassword('DemoPassword123!');
    handlePerformLogin('patient.demo@medigraph.ai', 'DemoPassword123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAF9',
      padding: '2rem 1.5rem',
      backgroundImage: 'radial-gradient(#D5DFDA 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      position: 'relative'
    }}>
      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      {/* Top Bar with Language Toggle */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        right: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <button
          onClick={() => setLangModalOpen(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#0F766E',
            cursor: 'pointer'
          }}
          title="Select Language / भाषा चुनें"
        >
          <span>🌐</span>
          <span>{currentLangObj.native}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>▼</span>
        </button>
      </div>

      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: '#0F5132',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '1.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 14px rgba(15, 81, 50, 0.25)'
          }}>
            MG
          </div>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.875rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#111827'
          }}>
            {t.brandName}
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            color: '#4B5563',
            marginTop: '0.35rem',
            lineHeight: 1.45
          }}>
            {t.loginSubtitle || t.brandTagline}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{
          padding: '2.25rem',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
        }}>
          {error && (
            <div className="alert alert-warning" style={{
              marginBottom: '1.5rem',
              backgroundColor: '#FEF3C7',
              borderColor: '#FDE68A',
              color: '#92400E',
              borderRadius: '8px',
              padding: '0.85rem 1rem'
            }}>
              <span>⚠️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.825rem' }}>Notice</strong>
                <span style={{ fontSize: '0.825rem' }}>{error}</span>
              </div>
            </div>
          )}

          {/* Instant 1-Click Demo Sandbox */}
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderLeft: '4px solid #0F5132',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, color: '#0F5132', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.enterDemo || 'Instant 1-Click Demo'}
              </span>
              <span style={{
                backgroundColor: '#DCFCE7',
                color: '#166534',
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px'
              }}>
                Pre-Loaded Reports
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#374151', marginBottom: '1rem', lineHeight: 1.5 }}>
              {t.demoDesc || 'Explore full health records, 27 extracted lab tests, and live graphs instantly.'}
            </p>
            <button
              type="button"
              onClick={handleInstantDemo}
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                backgroundColor: '#0F5132',
                borderColor: '#0B3D26',
                color: '#FFFFFF',
                borderRadius: '6px'
              }}
            >
              {loading ? 'Authenticating...' : (t.enterDemo || '⚡ Enter Demo Sandbox (Jane Doe)')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
              {t.orSignIn || 'Or sign in with email'}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                {t.emailLabel || 'Email Address'}
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                {t.passwordLabel || 'Password'}
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '6px'
              }}
              disabled={loading}
            >
              {loading ? 'Verifying Session...' : (t.signInBtn || 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              {t.needAccount || 'Need a new account?'}{' '}
              <Link to="/register" style={{ fontWeight: 600, color: '#0F5132' }}>
                {t.createAccount || 'Create account'}
              </Link>
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.5 }}>
          {t.privacyFooter || 'HIPAA & GDPR Compliant Architecture · Local Encryption · Non-Diagnostic Intelligence'}
        </div>
      </div>
    </div>
  );
}
