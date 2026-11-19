import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, FileText, ArrowRight, Activity, Filter } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, EmptyState, SkeletonCard } from '../components/ui';

export function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
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
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTimeline();
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Longitudinal Health Timeline
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
          Chronological sequence of clinical encounters, diagnostic lab visits, and health briefings.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <Input
            icon={Search}
            placeholder="Search clinical visits, test panels, or doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" type="submit">
          Filter
        </Button>
      </form>

      {/* Timeline Stream */}
      {loading ? (
        <SkeletonCard rows={5} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Clinical Milestones"
          description="Uploaded reports and doctor briefings will automatically construct your multi-year timeline."
        />
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border)' }}>
          {events.map((evt) => {
            const dateStr = new Date(evt.eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={evt.id} style={{ position: 'relative', marginBottom: '28px' }}>
                {/* Timeline Node Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-31px',
                  top: '14px',
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--surface)',
                  border: '3px solid var(--accent)'
                }} />

                <Card>
                  <CardContent style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-ink)' }}>
                        {dateStr}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {evt.eventType || 'LAB_PANEL'}
                      </Badge>
                    </div>

                    <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                      {evt.title}
                    </h3>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', lineHeight: 'var(--leading-sm)' }}>
                      {evt.description}
                    </p>

                    {evt.documentId && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to={`/documents/${evt.documentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 500 }}>
                          <span>Inspect Report Source</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
