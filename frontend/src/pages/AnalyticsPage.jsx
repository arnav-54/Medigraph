import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { api } from '../api/client.js';

export function AnalyticsPage() {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [trendData, setTrendData] = useState(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available tests
  useEffect(() => {
    async function loadTests() {
      try {
        const res = await api.get('/api/v1/analytics/lab-tests');
        if (res.success && res.data?.tests) {
          setAvailableTests(res.data.tests);
          if (res.data.tests.length > 0) {
            setSelectedTest(res.data.tests[0].labTestId || res.data.tests[0].rawName);
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

  // Fetch trend series when selected test changes
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

  const stats = trendData?.statistics;
  const series = trendData?.series || [];

  // Determine reference range bounds if available in source
  const refLow = series[0]?.refLow;
  const refHigh = series[0]?.refHigh;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Laboratory Trend Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Deterministic longitudinal analysis with unit-compatibility enforcement
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="form-label">Select Laboratory Measurement</label>
            <select
              className="form-input"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
            >
              {availableTests.map((t, idx) => (
                <option key={idx} value={t.labTestId || t.rawName}>
                  {t.displayName} ({t.unit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
              />
              <span>Filter Verified Records Only</span>
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics data...</div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : !trendData || series.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No historical measurements found for this test. Upload multiple reports over time to observe trajectories.
        </div>
      ) : (
        <>
          {trendData.warning && (
            <div className="alert alert-info">
              <span>ℹ️</span>
              <span>{trendData.warning}</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LATEST MEASUREMENT</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {stats?.latestValue} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{trendData.unit}</span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BASELINE MEASUREMENT</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {stats?.baselineValue} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{trendData.unit}</span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET CHANGE (DELTA)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stats?.delta > 0 ? 'var(--warning)' : 'var(--text-primary)', marginTop: '0.25rem' }}>
                {stats?.delta !== null ? (stats.delta > 0 ? `+${stats.delta}` : stats.delta) : 'N/A'}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LONGITUDINAL DIRECTION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stats?.direction === 'INCREASING' ? 'var(--warning)' : 'var(--success)', marginTop: '0.5rem' }}>
                {stats?.direction || 'STABLE'}
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{trendData.testName} Longitudinal Trajectory</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Units: {trendData.unit} • Enforced Unit Consistency
              </span>
            </div>

            <div style={{ height: '360px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="testDate" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                    unit={` ${trendData.unit}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'white', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontSize: '0.8125rem' }}>
                            <div style={{ fontWeight: 600 }}>{d.testDate}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, margin: '0.25rem 0' }}>
                              Value: {d.numericValue} {d.unit}
                            </div>
                            <div>Ref Range: {d.referenceRangeRaw || 'N/A'}</div>
                            <div>Flag: {d.isAbnormalFlag ? 'ABNORMAL' : 'NORMAL'}</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Source: {d.source.filename} (Pg {d.source.pageNumber})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {refLow !== null && refHigh !== null && (
                    <ReferenceArea y1={refLow} y2={refHigh} fill="#e0f2fe" fillOpacity={0.4} />
                  )}
                  <Line
                    type="monotone"
                    dataKey="numericValue"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Shaded blue band indicates laboratory reference range ({refLow || 'N/A'} - {refHigh || 'N/A'} {trendData.unit}) when reported by source.
            </div>
          </div>

          {/* Measurements Table */}
          <div className="card">
            <h2 className="card-title">Recorded Data Points</h2>
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Value</th>
                    <th>Reference Range</th>
                    <th>Flag</th>
                    <th>Source Document</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((pt) => (
                    <tr key={pt.id}>
                      <td>{pt.testDate}</td>
                      <td style={{ fontWeight: 600 }}>{pt.rawValue} {pt.unit}</td>
                      <td>{pt.referenceRangeRaw || 'None'}</td>
                      <td>
                        {pt.isAbnormalFlag ? (
                          <span className="badge badge-warning">ABNORMAL</span>
                        ) : (
                          <span className="badge badge-neutral">NORMAL</span>
                        )}
                      </td>
                      <td>
                        {pt.source.filename} (Pg {pt.source.pageNumber})
                      </td>
                      <td>
                        <span className="badge badge-info">{pt.verificationStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
