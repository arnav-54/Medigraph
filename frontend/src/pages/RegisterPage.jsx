import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentAI, setConsentAI] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentData || !consentAI) {
      setError('You must grant data processing and AI analysis consent to provision an account.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the details provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FBFBFA',
      padding: '2.5rem 1.5rem',
      backgroundImage: 'radial-gradient(#E3E5DD 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '4px',
            backgroundColor: '#0D3E6B',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 2px 8px rgba(13, 62, 107, 0.25)'
          }}>
            MG
          </div>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#121824'
          }}>
            Provision Patient Workspace
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#728093',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: '0.35rem'
          }}>
            Zero-Knowledge Longitudinal Clinical Archive
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: '0 8px 30px rgba(18, 24, 36, 0.06)' }}>
          {error && (
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
              <span>⚠️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.8rem' }}>Registration Notice</strong>
                <span style={{ fontSize: '0.825rem' }}>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Doe / Patient Name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Master Passphrase (Min. 8 characters)</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                minLength={8}
                required
              />
            </div>

            {/* Regulatory Consent Checkboxes */}
            <div style={{
              margin: '1.25rem 0',
              padding: '1rem',
              backgroundColor: '#FAFBF8',
              border: '1px solid #E3E5DD',
              borderRadius: 'var(--radius-subtle)'
            }}>
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consentData}
                  onChange={(e) => setConsentData(e.target.checked)}
                  style={{ marginTop: '0.2rem', width: 'auto' }}
                  required
                />
                <span style={{ fontSize: '0.785rem', color: '#424E5E', lineHeight: 1.45 }}>
                  <strong>GDPR Art. 6 / HIPAA Storage Consent:</strong> I authorize local encrypted ingestion and secure cryptographic storage of my diagnostic laboratory records.
                </span>
              </label>

              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consentAI}
                  onChange={(e) => setConsentAI(e.target.checked)}
                  style={{ marginTop: '0.2rem', width: 'auto' }}
                  required
                />
                <span style={{ fontSize: '0.785rem', color: '#424E5E', lineHeight: 1.45 }}>
                  <strong>Biomarker Extraction Consent:</strong> I authorize deterministic parsing and OCR of laboratory panels for personal longitudinal trend visualization.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Provisioning Vault...' : 'Provision Secure Workspace'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #ECEEE6' }}>
            <span style={{ fontSize: '0.825rem', color: '#728093' }}>
              Already provisioned? <Link to="/login" style={{ fontWeight: 600, color: '#0D3E6B' }}>Sign in here</Link>
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#728093', lineHeight: 1.5 }}>
          HIPAA & GDPR Architectural Isolation · Local Cryptographic Storage · Non-Diagnostic Clinical Computing
        </div>
      </div>
    </div>
  );
}
