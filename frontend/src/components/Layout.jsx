import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DisclaimerBanner } from './DisclaimerBanner.jsx';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/upload', label: 'Upload Document', icon: '📤' },
    { to: '/documents', label: 'Document Library', icon: '📁' },
    { to: '/timeline', label: 'Medical Timeline', icon: '🗓️' },
    { to: '/analytics', label: 'Lab Analytics', icon: '📈' },
    { to: '/assistant', label: 'AI Assistant', icon: '💬' },
    { to: '/summaries', label: 'Health Summaries', icon: '📋' },
    { to: '/privacy', label: 'Privacy & Settings', icon: '🔒' }
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>
          <div>
            <div className="brand-title">MediGraph AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Intelligence</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Synthetic Demo Mode
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Welcome back, <strong>{user?.fullName || user?.email}</strong>
          </div>
          <div className="user-badge">
            <span className="badge badge-info">{user?.role || 'PATIENT'}</span>
            <div className="user-avatar">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
          <DisclaimerBanner />
        </main>
      </div>
    </div>
  );
}
