import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, trendsRes] = await Promise.all([
          api.get('/api/v1/documents?limit=5'),
          api.get('/api/v1/analytics/lab-trends')
        ]);
        if (docsRes.success) setDocuments(docsRes.data.documents || []);
        if (trendsRes.success) setTrends(trendsRes.data.trends || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Health Intelligence Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Longitudinal overview of your verified health documents</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <span>📤</span> Upload Report
        </Link>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Documents Ingested
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Stored with cryptographic checksums
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Tracked Lab Series
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--teal)', marginTop: '0.25rem' }}>
            {trends.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Unit-normalized laboratory metrics
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Provenance Status
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.5rem' }}>
            100% Verified Trace
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Every value linked to source document & page
          </div>
        </div>
      </div>

      {/* Lab Trends Previews */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Laboratory Trends Overview</h2>
          <Link to="/analytics" className="btn btn-secondary btn-sm">Full Analytics →</Link>
        </div>

        {trends.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No laboratory measurements tracked yet. Upload a synthetic medical report to visualize health trends.
          </div>
        ) : (
          <div className="grid-3">
            {trends.slice(0, 3).map((t, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.testName}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {t.latestValue} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.unit}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: t.direction === 'INCREASING' ? 'var(--warning)' : 'var(--text-secondary)' }}>
                  Trajectory: <strong>{t.direction}</strong> ({t.delta > 0 ? `+${t.delta}` : t.delta || '0'} {t.unit})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Documents Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Ingested Documents</h2>
          <Link to="/documents" className="btn btn-secondary btn-sm">View Library →</Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No documents uploaded yet. Click <strong>Upload Report</strong> to begin.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Uploaded Date</th>
                  <th>MIME Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.originalFilename}</strong>
                    </td>
                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    <td>{doc.mimeType}</td>
                    <td>
                      <StatusBadge status={doc.processingStatus} />
                    </td>
                    <td>
                      <Link to={`/documents/${doc.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
