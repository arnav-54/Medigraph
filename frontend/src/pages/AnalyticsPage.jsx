import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';

export function AnalyticsPage() {
  const { t, lang } = useLanguage();
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [compareTest, setCompareTest] = useState('');
  const [enableCompare, setEnableCompare] = useState(false);
  const [trendData, setTrendData] = useState(null);
  const [compareTrendData, setCompareTrendData] = useState(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dictionaryBiomarker, setDictionaryBiomarker] = useState(null);

  // Load available tests catalog
  useEffect(() => {
    async function loadTests() {
      try {
        const res = await api.get('/api/v1/analytics/lab-tests');
        if (res.success && res.data?.tests) {
          setAvailableTests(res.data.tests);
          if (res.data.tests.length > 0) {
            setSelectedTest(res.data.tests[0].labTestId || res.data.tests[0].rawName);
            if (res.data.tests.length > 1) {
              setCompareTest(res.data.tests[1].labTestId || res.data.tests[1].rawName);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load lab tests catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  // Fetch primary trend series
  useEffect(() => {
    if (!selectedTest) return;

    async function loadTrend() {
      setLoading(true);
      setError(null);
      try {
        const query = onlyVerified ? '?onlyVerified=true' : '';
        const res = await api.get(`/api/v1/analytics/lab-trends/${encodeURIComponent(selectedTest)}${query}`);
        if (res.success && res.data?.trend) {
          setTrendData(res.data.trend);
        }
      } catch (err) {
        setError(err.message || 'Failed to load trend analytics');
        setTrendData(null);
      } finally {
        setLoading(false);
      }
    }
    loadTrend();
  }, [selectedTest, onlyVerified]);

  // Fetch comparison trend series
  useEffect(() => {
    if (!enableCompare || !compareTest) {
      setCompareTrendData(null);
      return;
    }

    async function loadCompareTrend() {
      try {
        const query = onlyVerified ? '?onlyVerified=true' : '';
        const res = await api.get(`/api/v1/analytics/lab-trends/${encodeURIComponent(compareTest)}${query}`);
        if (res.success && res.data?.trend) {
          setCompareTrendData(res.data.trend);
        }
      } catch (err) {
        console.error('Failed to load comparison trend:', err);
      }
    }
    loadCompareTrend();
  }, [enableCompare, compareTest, onlyVerified]);

  const stats = trendData?.statistics;
  const primarySeries = trendData?.series || [];

  // Merge series if comparing
  const chartSeries = primarySeries.map((item, idx) => {
    const primaryNum = Number(item.numericValue ?? item.normalizedValue ?? parseFloat(item.rawValue) ?? 0);
    const entry = {
      testDate: item.testDate,
      value: primaryNum,
      rawValue: item.rawValue,
      referenceRange: item.referenceRangeRaw
    };

    if (enableCompare && compareTrendData?.series?.[idx]) {
      const compItem = compareTrendData.series[idx];
      const compNum = Number(compItem.numericValue ?? compItem.normalizedValue ?? parseFloat(compItem.rawValue) ?? 0);
      entry.compareValue = compNum;
    }
    return entry;
  });

  return (
    <div>
      {/* Header Deck */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-press)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
                <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
                {lang === 'hi' ? 'स्वास्थ्य ग्राफ व ट्रैकिंग' : 'LONGITUDINAL BIOMARKER TRAJECTORIES'}
              </span>
              <span className="status-pill status-pill-neutral">
                {lang === 'hi' ? 'यूनिट नॉर्मलाइज्ड' : 'UNIT-NORMALIZED'}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.875rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)',
              lineHeight: 1.15
            }}>
              {t.analyticsTitle || 'Biomarker Trends & Trajectories'}
            </h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '0.35rem', maxWidth: '680px' }}>
              {t.analyticsSubtitle || 'Compare your blood test results across multiple years to see if values are improving.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.25rem' }}>
                {t.selectBiomarker || 'Select Lab Test:'}
              </label>
              <select
                className="form-input"
                style={{ fontWeight: 600, fontSize: '0.85rem' }}
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                {availableTests.map((tItem, idx) => (
                  <option key={idx} value={tItem.labTestId || tItem.rawName}>
                    {tItem.displayName} ({tItem.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Dictionary Trigger */}
            <div style={{ paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setDictionaryBiomarker(trendData?.testName || selectedTest)}
                className="btn btn-secondary"
                style={{ fontSize: '0.825rem' }}
              >
                📖 {t.learnMore || 'Learn About Test'}
              </button>
            </div>
          </div>
        </div>

        {/* Comparison and Filter Bar */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={enableCompare}
              onChange={(e) => setEnableCompare(e.target.checked)}
            />
            <span>{t.compareMode || 'Compare with second biomarker (e.g. HDL vs LDL)'}</span>
          </label>

          {enableCompare && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{lang === 'hi' ? 'दूसरा टेस्ट:' : 'Compare with:'}</span>
              <select
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                value={compareTest}
                onChange={(e) => setCompareTest(e.target.value)}
              >
                {availableTests.filter(tItem => (tItem.labTestId || tItem.rawName) !== selectedTest).map((tItem, idx) => (
                  <option key={idx} value={tItem.labTestId || tItem.rawName}>
                    {tItem.displayName} ({tItem.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
            />
            <span>{lang === 'hi' ? 'केवल सत्यापित रिकॉर्ड' : 'Verified records only'}</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
          <div>{lang === 'hi' ? 'ग्राफ डेटा लोड हो रहा है...' : 'Calibrating trajectory series...'}</div>
        </div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : !trendData || chartSeries.length === 0 ? (
        <div className="clinical-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
            {lang === 'hi' ? 'कम से कम 2 रिपोर्ट अपलोड करें' : 'Insufficient Multi-Visit Data for Long-term Regression'}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', maxWidth: '440px', margin: '0.5rem auto 0' }}>
            {lang === 'hi'
              ? 'ग्राफ और ट्रेंड देखने के लिए अपनी पिछली लैब रिपोर्ट्स अपलोड करें।'
              : 'Ingest additional historical lab panels to populate multi-point regression lines and velocity indicators.'}
          </p>
        </div>
      ) : (
        <>
          {/* Key Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="clinical-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {t.latestReading || 'Latest Reading'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  {stats?.latestValue}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {trendData.unit}
                </span>
              </div>
            </div>

            <div className="clinical-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {t.baselineReading || 'Baseline Record'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  {stats?.baselineValue}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {trendData.unit}
                </span>
              </div>
            </div>

            <div className="clinical-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {lang === 'hi' ? 'कुल अंतर (Change)' : 'Net Change (Δ)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: stats?.delta > 0 ? '#854D0E' : '#15803D'
                }}>
                  {stats?.delta !== null ? (stats.delta > 0 ? `+${stats.delta}` : stats.delta) : '0.0'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {trendData.unit}
                </span>
              </div>
            </div>

            <div className="clinical-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {t.netTrajectory || 'Trend Direction'}
              </div>
              <div style={{ marginTop: '0.4rem' }}>
                <span className={`status-pill ${stats?.direction === 'INCREASING' ? 'status-pill-elevated' : 'status-pill-normal'}`} style={{ fontSize: '0.85rem' }}>
                  {stats?.direction === 'INCREASING'
                    ? (lang === 'hi' ? '↑ बढ़ रहा है' : '↑ INCREASING')
                    : stats?.direction === 'DECREASING'
                    ? (lang === 'hi' ? '↓ घट रहा है' : '↓ DECREASING')
                    : (lang === 'hi' ? '→ स्थिर है' : '→ STABLE')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="clinical-card">
            <div className="clinical-card-header">
              <div>
                <div className="clinical-card-title">
                  {trendData.testName} {enableCompare && compareTrendData ? `vs ${compareTrendData.testName}` : (lang === 'hi' ? 'स्वास्थ्य वक्र' : 'Longitudinal Curve')}
                </div>
                <div className="clinical-card-caption">
                  {lang === 'hi' ? `माप: ${trendData.unit} · समय के साथ बदलाव` : `Calibrated in ${trendData.unit} across visits`}
                </div>
              </div>
            </div>

            <div style={{ height: '380px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="testDate"
                    stroke="#6B7280"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fontSize: 11 }}
                    domain={['auto', 'auto']}
                    unit={` ${trendData.unit}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{
                            backgroundColor: '#FFFFFF',
                            padding: '0.85rem 1rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748B', marginBottom: '0.35rem' }}>
                              📅 {d.testDate}
                            </div>
                            <div style={{ color: '#0D9488', fontWeight: 800, fontSize: '1rem' }}>
                              {trendData.testName}: {payload[0].value} {trendData.unit}
                            </div>
                            {enableCompare && payload[1] && (
                              <div style={{ color: '#0284C7', fontWeight: 800, fontSize: '1rem', marginTop: '0.25rem' }}>
                                {compareTrendData?.testName}: {payload[1].value} {compareTrendData?.unit}
                              </div>
                            )}
                            {d.referenceRange && (
                              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.35rem' }}>
                                Safe Range: [{d.referenceRange}]
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={trendData.testName}
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{ fill: '#0D9488', r: 5 }}
                    activeDot={{ r: 8, stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  {enableCompare && compareTrendData && (
                    <Line
                      type="monotone"
                      dataKey="compareValue"
                      name={compareTrendData.testName}
                      stroke="#0284C7"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={{ fill: '#0284C7', r: 5 }}
                      activeDot={{ r: 8, stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Dictionary Modal for direct in-place explanation */}
      {dictionaryBiomarker && (
        <BiomarkerDictionaryModal
          initialBiomarker={dictionaryBiomarker}
          onClose={() => setDictionaryBiomarker(null)}
        />
      )}
    </div>
  );
}
