import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
  const { user, logout } = useAuth();
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
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    if (!window.confirm('CRITICAL WARNING: This action is permanent. All your uploaded medical files, extracted laboratory values, and AI chat sessions will be permanently purged. Proceed?')) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.post('/api/v1/privacy/delete-account', { password: deletePassword });
      await logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Ensure password is correct.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Privacy, Consent & Data Sovereignty</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your confidentiality settings, export complete data archives, and exercise account erasure.
        </p>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="card-title">Patient Profile Information</h2>
        <table className="data-table" style={{ marginTop: '1rem' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600, width: '35%' }}>Full Name</td>
              <td>{user?.fullName || 'Not specified'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Email Address</td>
              <td>{user?.email}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Account Role</td>
              <td>
                <span className="badge badge-info">{user?.role}</span>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Synthetic Demo Mode</td>
              <td>Active (Demonstration Environment)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* GDPR Data Portability */}
      <div className="card">
        <h2 className="card-title">Data Portability & Export (GDPR Art. 20)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
          You have the legal right to obtain a machine-readable copy of all your health records, document metadata, extracted laboratory results, timeline events, and audit logs.
        </p>
        <button
          onClick={handleExportData}
          className="btn btn-secondary"
          disabled={exporting}
        >
          {exporting ? 'Generating Archive...' : '📥 Download Complete JSON Health Export'}
        </button>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <h2 className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone: Permanently Delete Account</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
          Once you delete your account, there is no going back. All stored files on disk, extracted values, and conversation history are immediately purged in accordance with data protection mandates.
        </p>

        {deleteError && <div className="alert alert-warning">{deleteError}</div>}

        <form onSubmit={handleDeleteAccount} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
              required
            />
          </div>
          <button type="submit" className="btn btn-danger" disabled={deleting}>
            {deleting ? 'Purging All Data...' : 'Permanently Purge Account & Records'}
          </button>
        </form>
      </div>
    </div>
  );
}
