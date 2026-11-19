import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  FileUp,
  Files,
  Calendar,
  LineChart,
  Bot,
  ClipboardList,
  Shield,
  BookOpen,
  Globe,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from './BiomarkerDictionaryModal.jsx';
import { LanguageSelectorModal } from './LanguageSelectorModal.jsx';
import { Button, Badge } from './ui';

export function Layout() {
  const { user, logout } = useAuth();
  const { lang, t, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: t.navDashboard || 'Overview', icon: Activity },
    { to: '/upload', label: t.navUpload || 'Upload Report', icon: FileUp },
    { to: '/documents', label: t.navDocuments || 'Records Archive', icon: Files },
    { to: '/timeline', label: t.navTimeline || 'Health Timeline', icon: Calendar },
    { to: '/analytics', label: t.navAnalytics || 'Biomarker Trends', icon: LineChart },
    { to: '/assistant', label: t.navAssistant || 'AI Consultation', icon: Bot },
    { to: '/summaries', label: t.navSummaries || 'Doctor Briefings', icon: ClipboardList },
    { to: '/privacy', label: t.navPrivacy || 'Data & Privacy', icon: Shield }
  ];

  const currentNav = navItems.find(n => location.pathname.startsWith(n.to)) || navItems[0];
  const CurrentIcon = currentNav.icon;
  const currentLangObj = languages.find(l => l.code === lang) || { native: 'English' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      {/* Global Modals */}
      <BiomarkerDictionaryModal isOpen={dictionaryOpen} onClose={() => setDictionaryOpen(false)} />
      <LanguageSelectorModal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} />

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(9,9,11,0.4)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Left Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 45,
          flexShrink: 0
        }}
        className={mobileNavOpen ? 'mobile-drawer-open' : ''}
      >
        <div>
          {/* Logo / Masthead */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--ink)', color: 'var(--ink-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
                  MediVault
                </span>
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                  Clinical Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Dictionary Action */}
          <div style={{ padding: '14px 16px 6px' }}>
            <button
              type="button"
              onClick={() => { setDictionaryOpen(true); setMobileNavOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--accent-ink)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <BookOpen size={14} strokeWidth={2} />
              <span>Biomarker Guide</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ padding: '6px 8px', fontSize: 'var(--text-2xs)', fontWeight: 500, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--ink)' : 'var(--ink-secondary)',
                    backgroundColor: isActive ? 'var(--surface-sub)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} style={{ color: isActive ? 'var(--accent)' : 'var(--ink-muted)' }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--ink-secondary)' }}>Vault Isolation</span>
              <Badge variant="normal" size="sm" dot>Encrypted</Badge>
            </div>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>Tenant Boundary Enforced</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{ height: '56px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              type="button"
              className="mv-mobile-toggle"
              style={{ display: 'none', padding: '6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', cursor: 'pointer' }}
              aria-label="Toggle navigation"
            >
              <Menu size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CurrentIcon size={16} style={{ color: 'var(--accent)' }} strokeWidth={2} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                {currentNav.label}
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Globe}
              iconRight={ChevronDown}
              onClick={() => setLangModalOpen(true)}
              title="Change Language"
            >
              {currentLangObj.native}
            </Button>

            {/* User Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--ink)', color: 'var(--ink-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-2xs)', fontWeight: 600 }}>
                {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink)' }}>
                {user?.fullName || user?.email?.split('@')[0] || 'Patient'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '28px 24px 64px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>

        {/* Professional Minimal Medical Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '20px 24px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 'var(--leading-xs)' }}>
          <p>
            <strong>MediVault</strong> · Personal Diagnostic Health Records & Clinical Intelligence · Non-Diagnostic Educational Platform
          </p>
          <p style={{ marginTop: '4px', color: 'var(--ink-faint)' }}>
            Information presented is extracted deterministically from uploaded records. Always consult a licensed physician for diagnosis or treatment decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
