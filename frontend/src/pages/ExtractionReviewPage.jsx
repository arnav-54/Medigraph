import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Edit3, BookOpen, FileText, CheckCircle2, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, SkeletonCard, Alert } from '../components/ui';

export function ExtractionReviewPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ rawValue: '', rawUnit: '', referenceRangeRaw: '' });
  const [dictionaryBiomarker, setDictionaryBiomarker] = useState(null);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  const fetchExtractions = async () => {
    try {
      const res = await api.get(`/api/v1/documents/${id}/extractions`);
      if (res.success) {
        setExtractions(res.data.extractions || []);
        return res.data.extractions || [];
      }
    } catch (err) {
      setError(err.message || 'Failed to load extracted lab results');
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    let intervalId = null;
    async function initialLoadAndPoll() {
      const items = await fetchExtractions();
      if (items.length === 0 && pollingCount < 4) {
        intervalId = setTimeout(() => {
          setPollingCount(prev => prev + 1);
        }, 1800);
      }
    }
    initialLoadAndPoll();
    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [id, pollingCount]);

  const handleRescan = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/v1/documents/${id}/reprocess`);
      setPollingCount(0);
      setTimeout(() => fetchExtractions(), 1200);
    } catch {
      fetchExtractions();
    }
  };

  const handleVerify = async (extractionId) => {
    try {
      await api.post(`/api/v1/extractions/${extractionId}/verify`);
      fetchExtractions();
    } catch (err) {
      setError(err.message || 'Verification failed');
    }
  };

  const handleVerifyAll = async () => {
    try {
      await api.post(`/api/v1/documents/${id}/verify-all`);
      fetchExtractions();
    } catch (err) {
      setError(err.message || 'Bulk verification failed');
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
      setError(err.message || 'Failed to update record');
    }
  };

  const verifiedCount = extractions.filter(r => r.verificationStatus === 'VERIFIED').length;
  const pendingCount = extractions.length - verifiedCount;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SkeletonCard rows={2} />
        <SkeletonCard rows={5} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
        initialSearch={dictionaryBiomarker}
      />

      {/* Edit Reading Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Correct Extracted Reading"
        description="Edit values if the OCR misread a digit or decimal point from your physical lab report."
      >
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Observed Numeric Value"
            type="text"
            value={editForm.rawValue}
            onChange={(e) => setEditForm({ ...editForm, rawValue: e.target.value })}
            required
          />

          <Input
            label="Measurement Unit"
            type="text"
            value={editForm.rawUnit}
            onChange={(e) => setEditForm({ ...editForm, rawUnit: e.target.value })}
            placeholder="mg/dL, g/dL, %"
          />

          <Input
            label="Laboratory Reference Interval"
            type="text"
            value={editForm.referenceRangeRaw}
            onChange={(e) => setEditForm({ ...editForm, referenceRangeRaw: e.target.value })}
            placeholder="e.g. 70 — 99 or < 200"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditingRecord(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Correction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <ArrowLeft size={13} />
              <span>Back to Archive</span>
            </Link>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--border-strong)' }}>/</span>
            <Badge variant="neutral" size="sm">Doc: {id?.slice(0, 8)}</Badge>
          </div>

          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Verify Machine-Extracted Readings
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Confirm measurements prior to committing them to longitudinal multi-year trend charts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--status-normal-ink)', fontWeight: 600 }}>{verifiedCount} Verified</span>
            <span>·</span>
            <span style={{ color: 'var(--status-borderline-ink)', fontWeight: 600 }}>{pendingCount} Pending</span>
          </div>

          <Button
            variant={pendingCount === 0 ? 'secondary' : 'primary'}
            size="sm"
            icon={Check}
            onClick={handleVerifyAll}
            disabled={extractions.length === 0 || pendingCount === 0}
          >
            {pendingCount === 0 ? 'All Verified ✓' : `Verify All (${pendingCount})`}
          </Button>

          {pendingCount === 0 && (
            <Link to="/analytics" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">
                View Trends →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="critical" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Extractions Table Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle as="h3">Observed Clinical Measurements</CardTitle>
            <CardDescription>Extracted with optical character provenance and LOINC catalog mapping</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={handleRescan}
          >
            Re-scan
          </Button>
        </CardHeader>

        <CardContent style={{ padding: 0 }}>
          {extractions.length === 0 ? (
            <div style={{ padding: '48px 24px' }}>
              <EmptyState
                icon={FileText}
                title="No Structured Measurements Found"
                description="The optical parsing queue may still be processing high-resolution scans. Click re-scan to refresh."
                action={
                  <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRescan}>
                    Check Ingestion Status
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Biomarker / Panel</TableHead>
                  <TableHead>Observed Value</TableHead>
                  <TableHead>Reference Range</TableHead>
                  <TableHead>OCR Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractions.map((record) => {
                  const lab = record.labResults?.[0];
                  const testName = lab?.labTest?.canonicalName || lab?.testNameRaw || 'Biomarker';
                  const isVerified = record.verificationStatus === 'VERIFIED';
                  const isEdited = record.verificationStatus === 'EDITED';
                  const confidence = Math.round((record.extractionConfidence || 0.95) * 100);

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{testName}</span>
                          <button
                            type="button"
                            onClick={() => { setDictionaryBiomarker(testName); setDictionaryOpen(true); }}
                            style={{ color: 'var(--ink-muted)', cursor: 'pointer', display: 'flex' }}
                            title="Learn normal ranges and explanation"
                          >
                            <BookOpen size={13} />
                          </button>
                        </div>
                        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                          Page {record.pageNumber || 1} · {lab?.labTest?.category || 'General'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>
                            {lab?.rawValue || '—'}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                            {lab?.normalizedUnit || lab?.rawUnit || ''}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)' }}>
                          {lab?.referenceRangeRaw || 'Standard clinical limits'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant={confidence >= 90 ? 'normal' : 'borderline'} size="sm">
                          {confidence}%
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={isVerified ? 'normal' : isEdited ? 'accent' : 'borderline'}
                          size="sm"
                          dot
                        >
                          {isVerified ? 'Verified' : isEdited ? 'Edited' : 'Pending'}
                        </Badge>
                      </TableCell>

                      <TableCell align="right">
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit3}
                            onClick={() => startEdit(record)}
                          >
                            Edit
                          </Button>

                          {!isVerified && (
                            <Button
                              variant="accent"
                              size="sm"
                              icon={Check}
                              onClick={() => handleVerify(record.id)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
