import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function ExtractionReviewPage() {
  const { id } = useParams();
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ rawValue: '', rawUnit: '', referenceRangeRaw: '' });

  const fetchExtractions = async () => {
    try {
      const res = await api.get(`/api/v1/documents/${id}/extractions`);
      if (res.success) {
        setExtractions(res.data.extractions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load extractions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtractions();
  }, [id]);

  const handleVerify = async (extractionId) => {
    try {
      await api.post(`/api/v1/extractions/${extractionId}/verify`);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleVerifyAll = async () => {
    try {
      await api.post(`/api/v1/documents/${id}/verify-all`);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Bulk verification failed');
    }
  };

  const startEdit = (record) => {
    const lab = record.labResults?.[0];
    setEditingRecord(record);
    setEditForm({
      rawValue: lab ? lab.rawValue : '',
      rawUnit: lab ? lab.rawUnit : '',
      referenceRangeRaw: lab ? (lab.referenceRangeRaw || '') : ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/v1/extractions/${editingRecord.id}`, editForm);
      setEditingRecord(null);
      fetchExtractions();
    } catch (err) {
      alert(err.message || 'Failed to save edits');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Human-in-the-Loop Extraction Review</h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Review, correct, and confirm extracted clinical values before promoting to your longitudinal timeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleVerifyAll} className="btn btn-primary">
            ✓ Verify All Records ({extractions.length})
          </button>
          <Link to={`/documents/${id}`} className="btn btn-secondary">
            Back to Document
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Extracted Laboratory Values ({extractions.length})</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Dual-confidence metrics & page provenance
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading extracted records...</div>
        ) : extractions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No structured lab values were detected in this document.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Flag</th>
                  <th>Page</th>
                  <th>OCR Conf.</th>
                  <th>Extr. Conf.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {extractions.map((rec) => {
                  const lab = rec.labResults?.[0];
                  return (
                    <tr key={rec.id}>
                      <td>
                        <strong>{lab?.testNameRaw || 'Unknown Test'}</strong>
                        {lab?.labTest && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Canonical: {lab.labTest.canonicalName}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lab?.rawValue}</td>
                      <td>{lab?.rawUnit || 'N/A'}</td>
                      <td>{lab?.referenceRangeRaw || 'None'}</td>
                      <td>
                        {lab?.isAbnormalFlag ? (
                          <span className="badge badge-warning">ABNORMAL</span>
                        ) : (
                          <span className="badge badge-neutral">NORMAL</span>
                        )}
                      </td>
                      <td>Pg {rec.pageNumber}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {Math.round(rec.ocrConfidence * 100 || 95)}%
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: rec.extractionConfidence < 0.85 ? 'var(--warning)' : 'inherit' }}>
                          {Math.round(rec.extractionConfidence * 100)}%
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={rec.verificationStatus} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {rec.verificationStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerify(rec.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--success)' }}
                              title="Verify Record"
                            >
                              ✓ Verify
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(rec)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Record"
                          >
                            ✎ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', margin: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Edit Extracted Value
            </h3>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Recorded Value</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.rawValue}
                  onChange={(e) => setEditForm({ ...editForm, rawValue: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.rawUnit}
                  onChange={(e) => setEditForm({ ...editForm, rawUnit: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reference Range</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.referenceRangeRaw}
                  onChange={(e) => setEditForm({ ...editForm, referenceRangeRaw: e.target.value })}
                  placeholder="e.g. 12.0 - 16.0"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingRecord(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
