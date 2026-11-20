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
import { LineChart as ChartIcon, BookOpen, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Layers, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, SkeletonCard, EmptyState, Alert } from '../components/ui';

function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 'var(--text-xs)' }}>
      <div style={{ color: 'var(--ink-muted)', marginBottom: '4px' }}>{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span>{entry.value} {entry.payload.unit}</span>
        </div>
      ))}
      {payload[0]?.payload?.source?.filename && (
        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', color: 'var(--ink-faint)', fontSize: 'var(--text-2xs)' }}>
          Source: {payload[0].payload.source.filename}
        </div>
      )}
    </div>
  );
}

export function AnalyticsPage() {
  const { lang } = useLanguage();
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
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

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
        console.error('Comparison trend error:', err);
      }
    }
    loadCompareTrend();
  }, [enableCompare, compareTest, onlyVerified]);

  // Combine primary and comparison series by testDate
  const chartData = React.useMemo(() => {
    if (!trendData || !trendData.series) return [];

    const map = new Map();
    trendData.series.forEach(item => {
      const val = Number(item.numericValue ?? item.normalizedValue ?? parseFloat(item.rawValue) ?? 0);
      map.set(item.testDate, {
        testDate: item.testDate,
        value: val,
        unit: trendData.unit,
        source: item.source
      });
    });

    if (enableCompare && compareTrendData && compareTrendData.series) {
      compareTrendData.series.forEach(item => {
        const val = Number(item.numericValue ?? item.normalizedValue ?? parseFloat(item.rawValue) ?? 0);
        const existing = map.get(item.testDate) || { testDate: item.testDate };
        existing.compareValue = val;
        existing.compareUnit = compareTrendData.unit;
        map.set(item.testDate, existing);
      });
    }

    return Array.from(map.values()).sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
  }, [trendData, compareTrendData, enableCompare]);

  const stats = trendData?.statistics || {};
  const delta = stats.delta;
  const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BiomarkerDictionaryModal
        isOpen={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
        initialSearch={dictionaryBiomarker}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Biomarker Trajectory Analytics
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Multi-year longitudinal trajectories computed deterministically across verified lab panels.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={BookOpen}
          onClick={() => { setDictionaryBiomarker(trendData?.testName); setDictionaryOpen(true); }}
        >
          Biomarker Guide
        </Button>
      </div>

      {error && (
        <Alert variant="warning" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Control Selector Bar */}
      <Card>
        <CardContent style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: 'var(--text-2xs)', fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>
                  Primary Biomarker
                </label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  style={{
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  {availableTests.map((t) => (
                    <option key={t.labTestId || t.rawName} value={t.labTestId || t.rawName}>
                      {t.displayName} ({t.unit})
                    </option>
                  ))}
                </select>
              </div>

              {enableCompare && (
                <div>
                  <label style={{ fontSize: 'var(--text-2xs)', fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>
                    Compare With
                  </label>
                  <select
                    value={compareTest}
                    onChange={(e) => setCompareTest(e.target.value)}
                    style={{
                      height: '34px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {availableTests.filter(t => (t.labTestId || t.rawName) !== selectedTest).map((t) => (
                      <option key={t.labTestId || t.rawName} value={t.labTestId || t.rawName}>
                        {t.displayName} ({t.unit})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={enableCompare ? 'accent' : 'secondary'}
                size="sm"
                icon={Layers}
                onClick={() => setEnableCompare(!enableCompare)}
              >
                {enableCompare ? 'Hide Comparison' : 'Compare Second Test'}
              </Button>

              <Button
                variant={onlyVerified ? 'primary' : 'ghost'}
                size="sm"
                icon={Filter}
                onClick={() => setOnlyVerified(!onlyVerified)}
              >
                {onlyVerified ? 'Verified Only' : 'Include Pending'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      {trendData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Card>
            <CardContent style={{ padding: '16px' }}>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Latest Reading</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink)' }}>{stats.latestValue ?? '—'}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>{trendData.unit}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Baseline Ingestion</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink)' }}>{stats.baselineValue ?? '—'}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>{trendData.unit}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Delta (Rate)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: 'var(--text-2xl)', fontWeight: 600, color: delta > 0 ? 'var(--status-borderline-ink)' : 'var(--ink)' }}>
                <DeltaIcon size={18} />
                <span>{delta !== null && delta !== undefined ? (delta > 0 ? `+${delta}` : delta) : '0.0'}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', fontWeight: 400 }}>{trendData.unit}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '16px' }}>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trajectory Trend</span>
              <div style={{ marginTop: '8px' }}>
                <Badge variant={stats.direction === 'STABLE' ? 'normal' : 'borderline'} size="md">
                  {stats.direction || 'STABLE'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recharts Canvas Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle as="h3">{trendData?.testName || 'Biomarker'} Trajectory Curve</CardTitle>
            <CardDescription>{chartData.length} sequential data points tracked over time</CardDescription>
          </div>
        </CardHeader>

        <CardContent style={{ padding: '24px 20px 12px' }}>
          {chartData.length === 0 ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#065F46' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                    Simulated Reference Trajectory (Fasting Blood Glucose across 2 Years)
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                  Upload your report to replace with personal curves
                </span>
              </div>

              {/* Sample simulated chart so user sees the real power */}
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { testDate: '15 Jan 2024', value: 98, unit: 'mg/dL' },
                      { testDate: '10 Jul 2024', value: 104, unit: 'mg/dL' },
                      { testDate: '18 Jan 2025', value: 110, unit: 'mg/dL' },
                      { testDate: '15 Nov 2026', value: 118, unit: 'mg/dL' }
                    ]}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="testDate"
                      stroke="var(--ink-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      stroke="var(--ink-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      domain={[80, 140]}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Fasting Blood Glucose (Sample)"
                      stroke="#065F46"
                      strokeWidth={3}
                      dot={{ fill: '#065F46', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div>
              {chartData.length === 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="var(--accent)" />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-ink)' }}>
                      Initial Baseline Reading Recorded: {chartData[0].value} {chartData[0].unit} ({chartData[0].testDate})
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)' }}>
                    Continuous longitudinal trajectory curves plot automatically once 2 or more reports are uploaded.
                  </span>
                </div>
              )}

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="testDate"
                      stroke="var(--ink-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      stroke="var(--ink-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      domain={chartData.length === 1 ? [(dataMin) => Math.max(0, Math.floor(dataMin * 0.8)), (dataMax) => Math.ceil(dataMax * 1.2)] : ['auto', 'auto']}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />

                    <Line
                      type="monotone"
                      dataKey="value"
                      name={trendData?.testName || 'Primary Biomarker'}
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--accent)', r: 6, strokeWidth: 2, stroke: 'var(--surface)' }}
                      activeDot={{ r: 8 }}
                    />

                  {enableCompare && compareTrendData && (
                    <Line
                      type="monotone"
                      dataKey="compareValue"
                      name={compareTrendData.testName || 'Comparison'}
                      stroke="#6366F1"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
