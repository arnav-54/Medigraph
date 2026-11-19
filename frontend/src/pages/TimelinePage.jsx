import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export function TimelinePage() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/api/v1/timeline?${params.toString()}`);
      if (res.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to load timeline events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTimeline();
  };

  return (
    <div>
      {/* Page Masthead */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--hairline)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
              <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
              {lang === 'hi' ? 'स्वास्थ्य टाइमलाइन' : 'HEALTH TIMELINE'}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--ink-primary)',
            marginBottom: '0.35rem'
          }}>
            {t.timelineTitle || 'Chronological Health Journey'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
            {t.timelineSubtitle || 'A complete timeline of your lab tests, doctor consultations, and health milestones.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchTimeline}
            className="btn btn-secondary"
            title="Refresh timeline records"
          >
            <span>↻</span> {t.refresh}
          </button>
          <Link
            to="/upload"
            className="btn btn-primary"
            style={{ fontWeight: 600, backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
          >
            <span>+</span> {t.upload}
          </Link>
        </div>
      </div>

      {/* Filter and Date Range Control */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder={lang === 'hi' ? 'टेस्ट या डॉक्टर विज़िट खोजें...' : 'Search encounter title, notes, or findings...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <span style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-faint)',
              fontSize: '0.9rem'
            }}>
              🔍
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
              {lang === 'hi' ? 'से:' : 'From:'}
            </span>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '150px' }}
              title="Start Date"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
              {lang === 'hi' ? 'तक:' : 'To:'}
            </span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '150px' }}
              title="End Date"
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            {lang === 'hi' ? 'फ़िल्टर करें' : 'Filter Ledger'}
          </button>
        </form>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⏳</div>
          <div>{lang === 'hi' ? 'टाइमलाइन लोड हो रही है...' : 'Synchronizing timeline events...'}</div>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.25rem',
            color: 'var(--ink-muted)'
          }}>
            📅
          </div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink-primary)', marginBottom: '0.35rem' }}>
            {lang === 'hi' ? 'कोई टाइमलाइन इवेंट नहीं मिला' : 'No Timeline Events Found'}
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
            {lang === 'hi' ? 'अपनी पहली रिपोर्ट अपलोड करें।' : 'No clinical records match this query. Ingest a laboratory report to generate milestones.'}
          </p>
          <Link to="/upload" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0F5132' }}>
            {t.upload}
          </Link>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
          {/* Vertical Spine Line */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '16px',
            bottom: '24px',
            width: '2px',
            backgroundColor: '#D1D5DB'
          }} />

          {events.map((evt, idx) => {
            const eventDate = new Date(evt.eventDate);
            return (
              <div key={evt.id || idx} style={{ position: 'relative', marginBottom: '2rem' }}>
                {/* Node Caliper Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '1.25rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #0F5132',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#0F5132'
                  }} />
                </div>

                <div className="card" style={{ marginBottom: 0, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginRight: '0.5rem', fontSize: '0.7rem' }}>
                        {evt.eventType || 'LAB_PANEL'}
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--ink-primary)' }}>
                        {evt.title}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      {eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {evt.description}
                  </p>

                  {evt.documentId && (
                    <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                        Source Record: {evt.documentId.slice(0, 12)}…
                      </span>
                      <Link
                        to={`/documents/${evt.documentId}/extractions`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        {lang === 'hi' ? 'टेस्ट देखें →' : 'View Extracted Tests →'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
