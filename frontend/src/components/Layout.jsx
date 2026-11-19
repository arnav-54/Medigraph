import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from './BiomarkerDictionaryModal.jsx';
import { LanguageSelectorModal } from './LanguageSelectorModal.jsx';

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
    { to: '/dashboard', label: t.navDashboard, icon: '🩺' },
    { to: '/upload', label: t.navUpload, icon: '📄' },
    { to: '/documents', label: t.navDocuments, icon: '📁' },
    { to: '/timeline', label: t.navTimeline, icon: '📅' },
    { to: '/analytics', label: t.navAnalytics, icon: '📈' },
    { to: '/assistant', label: t.navAssistant, icon: '🤖' },
    { to: '/summaries', label: t.navSummaries, icon: '📝' },
    { to: '/privacy', label: t.navPrivacy, icon: '🔒' }
  ];

  const currentNav = navItems.find(n => location.pathname.startsWith(n.to)) || { label: t.navDashboard, icon: '🩺' };
  const currentLangObj = languages.find(l => l.code === lang) || { native: 'English', name: 'English' };

  return (
    <div className="app-container">
      {/* Global Modals */}
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
      />

      <LanguageSelectorModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'active' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-masthead">
          <div className="masthead-logo">
            <div className="masthead-mark">MG</div>
            <div>
              <div className="masthead-title">MediGraph AI</div>
              <div className="masthead-sub">{t.brandTagline}</div>
            </div>
          </div>
        </div>

        {/* Test Guide Shortcut in Sidebar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setDictionaryOpen(true); setMobileNavOpen(false); }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              gap: '0.65rem',
              backgroundColor: '#F0FDFA',
              borderColor: '#99F6E4',
              color: '#0F766E',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.65rem 0.85rem'
            }}
          >
            <span>📖</span>
            <span>{t.navDictionary || 'Test Guide / Dictionary'}</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span style={{ fontSize: '1.1rem', marginRight: '0.2rem' }}>{item.icon}</span>
              <span style={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                Storage Protection
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                <span className="live-indicator" /> SECURE VAULT
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.35 }}>
              Zero Cloud Sharing · Encrypted
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.85rem' }}
          >
            <span>Sign Out ({user?.role || 'PATIENT'})</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="mobile-menu-btn"
              title="Toggle Menu"
            >
              ☰
            </button>

            <div className="specimen-tag" style={{ backgroundColor: '#F0FDFA', color: '#0F766E', borderColor: '#99F6E4' }}>
              <span style={{ fontSize: '1rem' }}>{currentNav.icon}</span>
              <span style={{ fontWeight: 700 }}>{currentNav.label}</span>
            </div>
          </div>

          {/* Top Actions: Dictionary, Multi-Language Selector, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Quick Dictionary Button */}
            <button
              onClick={() => setDictionaryOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#F8FAFC',
                color: '#0F766E',
                borderColor: '#99F6E4',
                fontWeight: 600
              }}
              title="Search test definitions, healthy ranges and dietary tips"
            >
              <span>🔍</span>
              <span>{t.navDictionary || 'Test Guide'}</span>
            </button>

            {/* Indian Languages Selector Modal Trigger */}
            <button
              onClick={() => setLangModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1'
              }}
              title="Choose Indian Language / भाषा चुनें"
            >
              <span>🌐</span>
              <span>{currentLangObj.native}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>▼</span>
            </button>

            {/* Patient Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {(user?.fullName || user?.email || 'J')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                  {user?.fullName || 'Jane Doe'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet />

          {/* Clean, Professional Medical Footer */}
          <footer className="medical-site-footer">
            <p>
              <strong>MediGraph AI</strong> · Personal Health Record & Biomarker Intelligence · Non-Diagnostic Educational Platform.
            </p>
            <p style={{ marginTop: '0.25rem' }}>
              Always consult a licensed medical doctor or healthcare professional for clinical decisions and medication changes.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
