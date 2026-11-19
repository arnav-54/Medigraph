import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { Layout } from './components/Layout.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { UploadPage } from './pages/UploadPage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage.jsx';
import { ExtractionReviewPage } from './pages/ExtractionReviewPage.jsx';
import { TimelinePage } from './pages/TimelinePage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { AssistantPage } from './pages/AssistantPage.jsx';
import { SummariesPage } from './pages/SummariesPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Verifying secure session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated SaaS Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetailsPage />} />
              <Route path="/documents/:id/extractions" element={<ExtractionReviewPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/summaries" element={<SummariesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

