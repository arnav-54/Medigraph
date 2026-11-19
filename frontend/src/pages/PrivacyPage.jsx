import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.get('/api/v1/privacy/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medigraph_health_archive_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError(lang === 'hi' ? 'कृपया खाता मिटाने के लिए अपना पासवर्ड दर्ज करें।' : 'Please enter your password to confirm permanent account erasure.');
      return;
    }

    if (!window.confirm(lang === 'hi'
      ? 'सावधानी: यह कदम वापस नहीं लिया जा सकता। आपके सभी मेडिकल दस्तावेज, टेस्ट वैल्यूज और चैट हमेशा के लिए डिलीट हो जाएंगे। क्या आप आगे बढ़ना चाहते हैं?'
      : 'CRITICAL WARNING: This action is permanent and non-reversible. All stored medical files, extracted laboratory values, and consultation history will be immediately purged. Proceed?')) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.post('/api/v1/privacy/delete-account', { password: deletePassword });
      await logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message || (lang === 'hi' ? 'खाता मिटाने में त्रुटि। पासवर्ड जांचें।' : 'Failed to delete account. Ensure password is correct.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header Deck */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-press)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
            <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
            {lang === 'hi' ? 'डेटा संप्रभुता व गोपनीयता' : 'DATA SOVEREIGNTY & PRIVACY'}
          </span>
          <span className="status-pill status-pill-normal">
            {lang === 'hi' ? '100% सुरक्षित' : 'TENANT ISOLATED'}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.875rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--ink-primary)',
          lineHeight: 1.15
        }}>
          {t.privacyTitle || 'Privacy, Consent & Data Ownership'}
        </h1>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
          {t.privacySubtitle || 'You own 100% of your health data. Download your full medical archive or delete your data at any time.'}
        </p>
      </div>

      {/* Patient Profile Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">{t.patientProfile || 'Patient Profile Information'}</div>
            <div className="card-caption">{lang === 'hi' ? 'खाता क्रेडेंशियल्स व सुरक्षा स्थिति' : 'Active user credentials and session'}</div>
          </div>
          <span className="status-pill status-pill-normal">ACTIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>{t.fullNameLabel || 'Full Name'}</span>
            <span style={{ fontWeight: 700, color: 'var(--ink-primary)', fontSize: '0.9rem' }}>{user?.fullName || 'Jane Doe'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>{t.emailAddressLabel || 'Primary Email'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--ink-primary)' }}>{user?.email || 'patient.demo@medigraph.ai'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>{t.accountRoleLabel || 'Account Role'}</span>
            <span className="badge badge-info">{user?.role || 'PATIENT'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>{t.storageEnvLabel || 'Storage Protection'}</span>
            <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
              {t.localStorageMsg || 'Local Cryptographic Vault (Zero Third-Party Cloud Transit)'}
            </span>
          </div>
        </div>
      </div>

      {/* GDPR Data Portability Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">{t.dataPortabilityTitle || 'Data Portability & Export (GDPR Art. 20)'}</div>
            <div className="card-caption">{lang === 'hi' ? 'सभी मेडिकल रिकॉर्ड्स की एक क्लिक में डाउनलोड' : 'Cryptographic archive of all tenant observations'}</div>
          </div>
          <span className="status-pill status-pill-normal">COMPLETE ARCHIVE</span>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {t.dataPortabilityDesc || 'Download your entire medical record history including lab values, unit conversions, and dates in JSON format.'}
        </p>

        <button
          onClick={handleExportData}
          className="btn btn-secondary"
          disabled={exporting}
          style={{ fontWeight: 600 }}
        >
          {exporting ? (lang === 'hi' ? 'आर्काइव तैयार हो रहा है...' : 'Generating Archive...') : (t.downloadBtn || '📥 Download Complete Health Archive')}
        </button>
      </div>

      {/* Danger Zone: Permanent Account Erasure */}
      <div className="card" style={{ borderColor: '#FECACA', backgroundColor: '#FFFDFD' }}>
        <div className="card-header" style={{ borderBottomColor: '#FEE2E2' }}>
          <div>
            <div className="card-title" style={{ color: '#991B1B' }}>
              {t.dangerZoneTitle || 'Danger Zone: Permanently Delete Account'}
            </div>
            <div className="card-caption" style={{ color: '#B91C1C' }}>
              {lang === 'hi' ? 'अपरिवर्तनीय क्रिया (Irreversible Action)' : 'Irreversible tenant data purge'}
            </div>
          </div>
          <span className="status-pill status-pill-critical">DESTRUCTIVE</span>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#7F1D1D', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {t.dangerZoneDesc || 'Executing account erasure permanently purges all uploaded PDF documents from local storage, removes all extracted laboratory measurements, and destroys consultation histories.'}
        </p>

        {deleteError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
            <span>⚠️</span>
            <span>{deleteError}</span>
          </div>
        )}

        <form onSubmit={handleDeleteAccount} style={{ maxWidth: '440px' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#991B1B', fontWeight: 600, fontSize: '0.85rem' }}>
              {t.confirmPasswordLabel || 'Confirm Password to Authorize Deletion'}
            </label>
            <input
              type="password"
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                borderColor: '#FCA5A5',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-danger"
            disabled={deleting}
            style={{ fontWeight: 600 }}
          >
            {deleting ? (lang === 'hi' ? 'मिटाया जा रहा है...' : 'Executing Purge...') : (t.deleteBtn || 'Permanently Delete Account & Medical Records')}
          </button>
        </form>
      </div>
    </div>
  );
}
