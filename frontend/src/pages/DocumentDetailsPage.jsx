import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Trash2, ArrowRight, Shield, Hash, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../api/client.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, SkeletonCard, Alert, Modal } from '../components/ui';

export function DocumentDetailsPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId = null;
    async function fetchDoc() {
      try {
        const res = await api.get(`/api/v1/documents/${id}`);
        if (res.success && res.data?.document) {
          setDocument(res.data.document);
          if (['QUEUED', 'PROCESSING', 'UPLOADED'].includes(res.data.document.processingStatus)) {
            intervalId = setTimeout(fetchDoc, 2000);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch document details');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/v1/documents/${id}`);
      navigate('/documents');
    } catch (err) {
      alert(err.message || 'Failed to delete document');
      setDeleting(false);
    }
  };

  if (loading) {
    return <SkeletonCard rows={5} />;
  }

  if (error || !document) {
    return (
      <Alert variant="critical" title="Document Not Found">
        {error || 'Unable to locate the requested clinical document.'}
        <div style={{ marginTop: '12px' }}>
          <Link to="/documents">
            <Button variant="secondary" size="sm">Back to Documents</Button>
          </Link>
        </div>
      </Alert>
    );
  }

  const isCompleted = document.processingStatus === 'COMPLETED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Diagnostic Record"
        description="Permanently purge this document and all associated extracted measurements from your isolated tenant vault."
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
          Are you sure you want to delete <strong>{document.originalFilename}</strong>? This action cannot be reversed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" loading={deleting} onClick={handleDelete}>
            Permanently Delete
          </Button>
        </div>
      </Modal>

      {/* Header Deck */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <ArrowLeft size={13} />
              <span>Back to Records</span>
            </Link>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--border-strong)' }}>/</span>
            <Badge variant="neutral" size="sm">DOC ID: {document.id.slice(0, 8)}</Badge>
          </div>

          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {document.originalFilename}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Uploaded {new Date(document.uploadedAt).toLocaleDateString()} · {((document.fileSizeBytes || 1024) / 1024).toFixed(1)} KB
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="destructive" size="sm" icon={Trash2} onClick={() => setDeleteModalOpen(true)}>
            Delete Record
          </Button>
          <Link to={`/documents/${document.id}/extractions`}>
            <Button variant="primary" size="sm" iconRight={ArrowRight}>
              Verify Extractions
            </Button>
          </Link>
        </div>
      </div>

      {/* Metadata & Status Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <Card>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <Clock size={14} />
              <span>Processing Lifecycle</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant={isCompleted ? 'normal' : 'borderline'} size="md" dot>
                {document.processingStatus}
              </Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)' }}>
                {document.extractedRecords?.length || 0} observations parsed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <Hash size={14} />
              <span>SHA-256 Fingerprint</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)', wordBreak: 'break-all' }}>
              {document.sha256Checksum || 'Deterministic Hash Generated'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <Shield size={14} />
              <span>Tenant Security</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
              Encrypted at rest · Patient isolated directory
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extracted Records Callout */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle as="h3">Associated Biomarker Measurements ({document.extractedRecords?.length || 0})</CardTitle>
            <CardDescription>Values extracted via OCR and canonical LOINC ontology matching</CardDescription>
          </div>
          <Link to={`/documents/${document.id}/extractions`}>
            <Button variant="secondary" size="sm">Audit & Edit</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {document.extractedRecords?.map((rec) => {
              const lab = rec.labResults?.[0];
              const name = lab?.labTest?.canonicalName || lab?.testNameRaw || 'Biomarker';
              return (
                <div key={rec.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{name}:</span>
                  <span style={{ color: 'var(--ink-secondary)' }}>{lab?.rawValue} {lab?.normalizedUnit || lab?.rawUnit}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
