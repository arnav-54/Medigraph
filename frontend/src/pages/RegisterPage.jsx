import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Alert } from '../components/ui';

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
      setError('You must grant data processing and clinical analysis consent to create an account.');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', backgroundColor: 'var(--canvas)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Mark */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--ink)', color: 'var(--ink-inverse)', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            MediVault
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '4px' }}>
            Isolated, Encrypted Longitudinal Health Architecture
          </p>
        </div>

        {error && (
          <Alert variant="critical" style={{ marginBottom: '16px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div>
              <CardTitle as="h2">Create patient workspace</CardTitle>
              <CardDescription>Your medical documents are encrypted and tenant-isolated</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Full name"
                type="text"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
              />

              <Input
                label="Email address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                required
              />

              <Input
                label="Password (min 8 characters)"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              {/* Consent Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', padding: '12px', backgroundColor: 'var(--surface-sub)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', lineHeight: 'var(--leading-xs)' }}>
                  <input
                    type="checkbox"
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>I authorize <strong>MediVault</strong> to store and parse my diagnostic records in an isolated tenant vault.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', lineHeight: 'var(--leading-xs)' }}>
                  <input
                    type="checkbox"
                    checked={consentAI}
                    onChange={(e) => setConsentAI(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>I consent to deterministic OCR extraction and zero-retention AI clinical consultation.</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '4px' }}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              Already registered?
            </span>
            <Link to="/login" style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--accent)' }}>
              Sign in to vault →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
