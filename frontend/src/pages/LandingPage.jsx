import React from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '70px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon">M</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>MediGraph AI</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Create Account</Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '1080px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          Longitudinal Health-Document Intelligence Platform
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
          Transform Medical Reports Into Longitudinal Clarity
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Securely ingest clinical PDFs and lab records, deterministically extract values with full source provenance, track physiological trends over time, and ask grounded questions with zero hallucination.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Demo Sign In
          </Link>
        </div>

        <div className="grid-3" style={{ textAlign: 'left', marginTop: '2rem' }}>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔬</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Deterministic Extraction</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Values, reference ranges, and units retain source document and page references with confidence tracking.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📈</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Unit-Aware Lab Trends</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Interactive time-series visualizations enforce strict unit compatibility and distinguish source flags from calculations.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Grounded RAG Assistant</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Answers strictly constrained to retrieved documents with verified citations and honest insufficient-evidence handling.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        MediGraph AI © 2026. Built with strict medical confidentiality and tenant isolation. For demonstration purposes using synthetic records.
      </footer>
    </div>
  );
}
