import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  User,
  Mail,
  HardDrive,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
  Alert,
  Modal
} from '../components/ui/index.js';

export function PrivacyPage() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    setExportSuccess(false);
    try {
      const data = await api.get('/api/v1/privacy/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medivault_health_archive_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenDeleteModal = (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError(
        lang === 'hi'
          ? 'कृपया खाता मिटाने के लिए अपना पासवर्ड दर्ज करें।'
          : 'Please enter your account password to authorize deletion.'
      );
      return;
    }
    setDeleteError(null);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.post('/api/v1/privacy/delete-account', { password: deletePassword });
      setConfirmModalOpen(false);
      await logout();
      navigate('/login');
    } catch (err) {
      setConfirmModalOpen(false);
      setDeleteError(
        err.message ||
          (lang === 'hi'
            ? 'खाता मिटाने में त्रुटि। पासवर्ड जांचें।'
            : 'Failed to delete account. Please verify your password.')
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Deck */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Badge variant="accent" icon={ShieldCheck}>
            {lang === 'hi' ? 'डेटा संप्रभुता व गोपनीयता' : 'Data Sovereignty & Privacy'}
          </Badge>
          <Badge variant="normal" dot>
            {lang === 'hi' ? 'सुरक्षित पृथक्करण' : 'Tenant Isolated'}
          </Badge>
        </div>

        <div>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '-0.02em',
              color: 'var(--ink-primary)',
              margin: 0
            }}
          >
            {t.privacyTitle || 'Privacy, Consent & Data Ownership'}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-secondary)',
              marginTop: 'var(--space-1)',
              marginBottom: 0
            }}
          >
            {t.privacySubtitle ||
              'You own 100% of your health data. Download your complete medical archive or permanently erase your records at any time.'}
          </p>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <CardTitle>{t.patientProfile || 'Patient Profile & Credentials'}</CardTitle>
              <CardDescription>
                {lang === 'hi' ? 'खाता क्रेडेंशियल्स व सक्रिय सत्र' : 'Active identity and isolation boundary'}
              </CardDescription>
            </div>
            <Badge variant="neutral">{user?.role || 'PATIENT'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4)'
              }}
            >
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-secondary)',
                    flexShrink: 0
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                    {t.fullNameLabel || 'Full Name'}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink-primary)' }}>
                    {user?.fullName || 'Jane Doe'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-secondary)',
                    flexShrink: 0
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                    {t.emailAddressLabel || 'Primary Email'}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink-primary)', wordBreak: 'break-all' }}>
                    {user?.email || 'patient.demo@medigraph.ai'}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-normal-text)',
                  flexShrink: 0
                }}
              >
                <HardDrive size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                  {t.storageEnvLabel || 'Storage Protection'}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  {t.localStorageMsg || 'Cryptographically partitioned storage with zero third-party data broker transit.'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Data Portability Card */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <CardTitle>{t.dataPortabilityTitle || 'Data Portability & Export (GDPR Art. 20)'}</CardTitle>
              <CardDescription>
                {lang === 'hi' ? 'सभी मेडिकल रिकॉर्ड्स का संरचित डाउनलोड' : 'Structured machine-readable snapshot of all health records'}
              </CardDescription>
            </div>
            <Badge variant="accent">Complete Archive</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0, marginBottom: 'var(--space-4)' }}>
            {t.dataPortabilityDesc ||
              'Download your entire medical record history including raw extractions, normalized biomarker trajectories, document fingerprints, and consultation transcripts in standard JSON format.'}
          </p>

          {exportSuccess && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Alert variant="normal" title={lang === 'hi' ? 'आर्काइव डाउनलोड हो गया' : 'Archive Downloaded Successfully'}>
                {lang === 'hi' ? 'आपकी स्वास्थ्य फ़ाइल सहेजी जा चुकी है।' : 'Your encrypted medical archive has been exported to your downloads folder.'}
              </Alert>
            </div>
          )}

          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportData}
            loading={exporting}
          >
            {exporting
              ? lang === 'hi' ? 'आर्काइव तैयार हो रहा है...' : 'Generating Archive...'
              : t.downloadBtn || 'Download Health Archive (JSON)'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone: Permanent Account Erasure */}
      <Card style={{ borderColor: 'var(--color-abnormal-border)' }}>
        <CardHeader style={{ borderBottomColor: 'var(--color-abnormal-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle size={18} color="var(--color-abnormal-text)" />
                <CardTitle style={{ color: 'var(--color-abnormal-text)' }}>
                  {t.dangerZoneTitle || 'Danger Zone: Permanently Delete Account'}
                </CardTitle>
              </div>
              <CardDescription style={{ color: 'var(--color-abnormal-text)', opacity: 0.85 }}>
                {lang === 'hi' ? 'अपरिवर्तनीय क्रिया (Irreversible Action)' : 'Irreversible tenant data purge and erasure'}
              </CardDescription>
            </div>
            <Badge variant="abnormal">Destructive</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-secondary)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 'var(--space-4)'
            }}
          >
            {t.dangerZoneDesc ||
              'Permanently purges all uploaded laboratory PDFs, deletes every extracted measurement, wipes longitudinal curves, and destroys consultation histories. This action cannot be undone.'}
          </p>

          {deleteError && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Alert variant="abnormal" title={lang === 'hi' ? 'त्रुटि' : 'Authorization Error'}>
                {deleteError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleOpenDeleteModal} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              type="password"
              label={t.confirmPasswordLabel || 'Confirm Account Password'}
              icon={Lock}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div>
              <Button
                type="submit"
                variant="destructive"
                icon={Trash2}
              >
                {t.deleteBtn || 'Permanently Delete Account & Medical Records'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={lang === 'hi' ? 'खाता स्थायी रूप से हटाएं?' : 'Confirm Irreversible Account Deletion'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Alert variant="abnormal" title={lang === 'hi' ? 'चेतावनी' : 'Critical Warning'}>
            {lang === 'hi'
              ? 'सावधानी: यह कदम वापस नहीं लिया जा सकता। आपके सभी मेडिकल दस्तावेज, टेस्ट वैल्यूज और चैट हमेशा के लिए डिलीट हो जाएंगे।'
              : 'This action is immediate and non-reversible. All stored PDF files, extracted biomarkers, and conversation history will be permanently destroyed.'}
          </Alert>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', margin: 0 }}>
            {lang === 'hi'
              ? 'क्या आप वास्तव में अपना खाता और सभी स्वास्थ्य रिकॉर्ड मिटाना चाहते हैं?'
              : 'Are you absolutely sure you want to proceed with permanent erasure?'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button
              variant="secondary"
              onClick={() => setConfirmModalOpen(false)}
              disabled={deleting}
            >
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              icon={Trash2}
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting
                ? lang === 'hi' ? 'मिटाया जा रहा है...' : 'Purging Records...'
                : lang === 'hi' ? 'हाँ, हमेशा के लिए मिटाएं' : 'Yes, Delete Everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
