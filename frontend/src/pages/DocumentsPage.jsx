import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, FileUp, CheckCircle2, Clock, ArrowRight, Shield } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, SkeletonCard } from '../components/ui';

export function DocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/documents');
      if (res.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filtered = documents.filter(doc =>
    doc.originalFilename.toLowerCase().includes(search.toLowerCase()) ||
    (doc.sha256Checksum && doc.sha256Checksum.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Clinical Records Archive
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Cryptographically fingerprinted diagnostic documents stored in your isolated vault.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="sm" icon={FileUp}>
            Upload New Report
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <Input
            icon={Search}
            placeholder="Search reports or checksum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {documents.length} records
        </span>
      </div>

      {/* Documents List Card */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '24px' }}>
              <SkeletonCard rows={4} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px' }}>
              <EmptyState
                icon={FileText}
                title="No Diagnostic Documents"
                description={search ? "No reports match your current search query." : "Upload your first medical report PDF or photo to begin tracking your records."}
                action={
                  <Link to="/upload">
                    <Button variant="primary" size="sm" icon={FileUp}>Upload Report</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Filename / Identifier</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Extracted Biomarkers</TableHead>
                  <TableHead>Integrity Fingerprint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => {
                  const extractedCount = doc.extractedRecords?.length || 0;
                  const isReady = doc.status === 'COMPLETED' || doc.status === 'READY' || extractedCount > 0;

                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={16} style={{ color: 'var(--accent)' }} />
                          <div>
                            <Link to={`/documents/${doc.id}`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                              {doc.originalFilename}
                            </Link>
                            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                              {doc.mimeType || 'application/pdf'} · {((doc.fileSizeBytes || 1024) / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)' }}>
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="neutral" size="sm">
                          {extractedCount} biomarkers
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)' }}>
                          {doc.sha256Checksum ? `${doc.sha256Checksum.slice(0, 14)}...` : 'Deterministic'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant={isReady ? 'normal' : 'borderline'} size="sm" dot>
                          {isReady ? 'Processed' : 'Queued'}
                        </Badge>
                      </TableCell>

                      <TableCell align="right">
                        <Link to={`/documents/${doc.id}/extractions`}>
                          <Button variant="secondary" size="sm" iconRight={ArrowRight}>
                            Verify Extractions
                          </Button>
                        </Link>
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
