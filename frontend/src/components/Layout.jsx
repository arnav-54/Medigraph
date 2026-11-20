import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
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
  UploadCloud,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from './BiomarkerDictionaryModal.jsx';
import { LanguageSelectorModal } from './LanguageSelectorModal.jsx';
import { BrandLogo } from './BrandLogo.jsx';
import { Button, Badge } from './ui/index.js';

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
    { to: '/dashboard', label: t.navDashboard || 'Health Overview', icon: Activity },
    { to: '/upload', label: t.navUpload || 'Upload Lab Report', icon: FileUp },
    { to: '/documents', label: t.navDocuments || 'My Medical Records', icon: Files },
    { to: '/timeline', label: t.navTimeline || 'Health Timeline', icon: Calendar },
    { to: '/analytics', label: t.navAnalytics || 'Biomarker Trends', icon: LineChart },
    { to: '/assistant', label: t.navAssistant || 'AI Consultation', icon: Bot },
    { to: '/summaries', label: t.navSummaries || 'Doctor Briefings', icon: ClipboardList },
    { to: '/privacy', label: t.navPrivacy || 'Data & Privacy', icon: Shield }
  ];

  const currentNav = navItems.find((n) => location.pathname.startsWith(n.to)) || navItems[0];
  const CurrentIcon = currentNav.icon;
  const currentLangObj = languages.find((l) => l.code === lang) || { native: 'English' };

  const userInitial = (user?.fullName || user?.email || 'A')[0].toUpperCase();
  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'Patient');

  return (
    <div className="mv-app-shell" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Global Modals */}
      <BiomarkerDictionaryModal isOpen={dictionaryOpen} onClose={() => setDictionaryOpen(false)} />
      <LanguageSelectorModal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} />

      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="mv-sidebar-backdrop"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`mv-sidebar ${mobileNavOpen ? 'mobile-drawer-open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Masthead / Brand Logo */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Link to="/dashboard" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none' }}>
              <BrandLogo size="md" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="mv-mobile-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer'
              }}
              aria-label="Close navigation menu"
            >
              <X size={18} color="var(--ink)" />
            </button>
          </div>

          {/* Biomarker Guide Pill Action */}
          <div style={{ padding: '14px 16px 8px' }}>
            <button
              type="button"
              onClick={() => {
                setDictionaryOpen(true);
                setMobileNavOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--accent-ink)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: '0 1px 3px rgba(6, 95, 70, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D1FAE5';
                e.currentTarget.style.borderColor = '#6EE7B7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-subtle)';
                e.currentTarget.style.borderColor = 'var(--accent-border)';
              }}
            >
              <BookOpen size={15} strokeWidth={2.2} />
              <span style={{ flex: 1, textAlign: 'left' }}>Biomarker Guide</span>
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--accent)',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  border: '1px solid var(--accent-border)'
                }}
              >
                11 LANG
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Clinical Records
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
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--ink-secondary)',
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                    transition: 'all 150ms ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-sub)';
                      e.currentTarget.style.color = 'var(--ink)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--ink-secondary)';
                    }
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={{ color: isActive ? 'var(--accent)' : 'var(--ink-muted)' }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer — Security & Logout */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--surface)'
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-sub)',
                border: '1px solid var(--border)',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-secondary)' }}>Vault Security</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#065F46',
                    backgroundColor: '#ECFDF5',
                    padding: '1px 7px',
                    borderRadius: '9999px',
                    border: '1px solid #A7F3D0'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#059669' }} />
                  Encrypted
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Tenant Boundary Enforced</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--ink-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
                e.currentTarget.style.color = '#991B1B';
                e.currentTarget.style.borderColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
                e.currentTarget.style.color = 'var(--ink-secondary)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="mv-main-layout">
        {/* Top Header Bar */}
        <header className="mv-topbar">
          {/* Left Title & Mobile Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              type="button"
              className="mv-mobile-toggle"
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0
                }}
              >
                <CurrentIcon size={16} strokeWidth={2.4} />
              </div>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentNav.label}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Quick Upload Pill Button (Hidden on Mobile) */}
            <Link to="/upload" className="mv-hide-mobile" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 'var(--text-xs)',
                  border: '1px solid #064E3B',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(6, 95, 70, 0.3)',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 95, 70, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 95, 70, 0.3)';
                }}
              >
                <UploadCloud size={15} strokeWidth={2.2} />
                <span>Upload</span>
              </button>
            </Link>

            {/* Language Switcher Pill */}
            <button
              onClick={() => setLangModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--ink-secondary)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              title="Change Language / भाषा बदलें"
            >
              <Globe size={14} color="var(--accent)" />
              <span className="mv-hide-xs">{currentLangObj.native}</span>
              <ChevronDown size={12} color="var(--ink-muted)" />
            </button>

            {/* User Profile Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 1px 3px rgba(6, 78, 59, 0.2)'
                }}
              >
                {userInitial}
              </div>
              <div className="mv-hide-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1.1
                  }}
                >
                  {displayName}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, lineHeight: 1 }}>
                  Patient Vault
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="mv-content-container">
          <Outlet />
        </main>

        {/* Discreet Medical Site Footer */}
        <footer className="mv-footer">
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#064E3B' }}>MediVault</strong> · Personal Longitudinal Health Records & Physiological Ledger · Non-Diagnostic Educational Platform
          </p>
          <p style={{ margin: 0, marginTop: '3px', color: 'var(--ink-faint)', fontSize: '11px' }}>
            Laboratory values are deterministically extracted from uploaded documents. Always consult a licensed medical physician for clinical advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
