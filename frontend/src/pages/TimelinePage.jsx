import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function TimelinePage() {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Medical Timeline</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Chronological longitudinal history of clinical reports and verified laboratory findings
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search timeline events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '160px' }}
            title="Start Date"
          />
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '160px' }}
            title="End Date"
          />
          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading timeline...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No timeline events recorded for this date range. Upload a medical report to populate your chronological record.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>

          {events.map((evt) => (
            <div key={evt.id} style={{ position: 'relative', marginBottom: '2rem' }}>
              {/* Timeline Node Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '1.25rem',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  border: '3px solid white',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />

              <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>{evt.eventType}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(evt.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{evt.title}</h3>
                  </div>
                  {evt.document && (
                    <Link to={`/documents/${evt.document.id}`} className="btn btn-secondary btn-sm">
                      View Report: {evt.document.originalFilename}
                    </Link>
                  )}
                </div>

                {evt.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {evt.description}
                  </p>
                )}

                {/* Lab Results in this Event */}
                {evt.labResults && evt.labResults.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Associated Laboratory Measurements ({evt.labResults.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      {evt.labResults.map((lr) => (
                        <div
                          key={lr.id}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: lr.isAbnormalFlag ? 'var(--warning-bg)' : 'var(--bg-secondary)',
                            border: `1px solid ${lr.isAbnormalFlag ? '#fde68a' : 'var(--border-color)'}`
                          }}
                        >
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{lr.testNameRaw}</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.15rem 0' }}>
                            {lr.rawValue} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lr.normalizedUnit}</span>
                          </div>
                          {lr.referenceRangeRaw && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Ref: {lr.referenceRangeRaw}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
