import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Alert, Badge } from '../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const { login } = useAuth();
  const { t, lang, languages } = useLanguage();
  const navigate = useNavigate();
  const currentLang = languages.find(l => l.code === lang) || { native: 'English' };

  const handlePerformLogin = async (userEmail, userPassword) => {
    setError(null);
    setLoading(true);
    try {
      await login(userEmail, userPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', backgroundColor: 'var(--canvas)' }}>
      <LanguageSelectorModal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} />

      {/* Language Switcher Pill */}
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={Globe}
          onClick={() => setLangModalOpen(true)}
        >
          {currentLang.native}
        </Button>
      </div>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Mark */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--ink)', color: 'var(--ink-inverse)', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            MediVault
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '4px' }}>
            {t.subtitle || 'Personal Health Records & Clinical Intelligence'}
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
              <CardTitle as="h2">Sign in to your health vault</CardTitle>
              <CardDescription>Enter your account credentials or explore sandbox demo</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Demo Sandbox Action */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-secondary)' }}>Instant Sandbox</span>
                <Badge variant="accent" size="sm">Pre-configured</Badge>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginBottom: '12px', lineHeight: 'var(--leading-xs)' }}>
                Inspect longitudinal biomarker graphs and RAG consultation immediately.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={Sparkles}
                onClick={handleInstantDemo}
                loading={loading}
                style={{ width: '100%' }}
              >
                Enter Demo Patient Sandbox
              </Button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label={t.emailAddress || 'Email address'}
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />

              <Input
                label={t.password || 'Password'}
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {t.signIn || 'Sign in'}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              {t.needAccount || "Don't have an account?"}
            </span>
            <Link to="/register" style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--accent)' }}>
              {t.createWorkspace || 'Create workspace →'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
