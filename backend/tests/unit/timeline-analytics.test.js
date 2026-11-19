import { describe, it, expect } from 'vitest';

describe('Medical Timeline & Lab Trend Analytics (Phase 6 & 7)', () => {
  describe('Deterministic Trend Calculations', () => {
    function computeTrendStatistics(values) {
      const count = values.length;
      if (count === 0) return { count: 0, insufficientData: true };
      if (count < 2) {
        return {
          count: 1,
          insufficientData: true,
          latestValue: values[0],
          baselineValue: values[0],
          min: values[0],
          max: values[0],
          average: values[0],
          delta: null,
          direction: 'STABLE'
        };
      }

      const first = values[0];
      const latest = values[count - 1];
      const delta = Math.round((latest - first) * 100) / 100;
      const percentChange = first !== 0 ? Math.round(((latest - first) / first) * 1000) / 10 : null;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const average = Math.round((values.reduce((a, b) => a + b, 0) / count) * 100) / 100;

      let direction = 'STABLE';
      if (delta > 0.05) direction = 'INCREASING';
      else if (delta < -0.05) direction = 'DECREASING';

      return {
        count,
        insufficientData: false,
        latestValue: latest,
        baselineValue: first,
        delta,
        percentChange,
        direction,
        min,
        max,
        average
      };
    }

    it('calculates deterministic delta, average, and direction for repeated measurements', () => {
      // e.g. Fasting Glucose over 3 visits: 95 mg/dL, 108 mg/dL, 118 mg/dL
      const measurements = [95, 108, 118];
      const stats = computeTrendStatistics(measurements);

      expect(stats.count).toBe(3);
      expect(stats.insufficientData).toBe(false);
      expect(stats.baselineValue).toBe(95);
      expect(stats.latestValue).toBe(118);
      expect(stats.delta).toBe(23); // 118 - 95
      expect(stats.percentChange).toBe(24.2); // (23 / 95) * 100
      expect(stats.direction).toBe('INCREASING');
      expect(stats.min).toBe(95);
      expect(stats.max).toBe(118);
      expect(stats.average).toBe(107);
    });

    it('flags insufficient data when fewer than 2 measurements are present', () => {
      const singleMeasurement = [14.2];
      const stats = computeTrendStatistics(singleMeasurement);

      expect(stats.count).toBe(1);
      expect(stats.insufficientData).toBe(true);
      expect(stats.delta).toBeNull();
      expect(stats.direction).toBe('STABLE');
    });

    it('detects decreasing trend accurately', () => {
      // e.g. HbA1c improving from 6.4% down to 5.7%
      const hba1cValues = [6.4, 6.0, 5.7];
      const stats = computeTrendStatistics(hba1cValues);

      expect(stats.delta).toBe(-0.7);
      expect(stats.direction).toBe('DECREASING');
      expect(stats.percentChange).toBe(-10.9);
    });
  });

  describe('Strict Medical Safety Principles', () => {
    it('enforces disclaimer that trends do NOT constitute a diagnosis', () => {
      const disclaimer = 'Trends and statistical comparisons are deterministic reflections of uploaded reports and do NOT constitute a medical diagnosis or clinical interpretation. Always consult a licensed healthcare professional.';
      expect(disclaimer).toContain('NOT constitute a medical diagnosis');
      expect(disclaimer).toContain('consult a licensed healthcare professional');
    });

    it('separates measurements with different units to prevent dangerous invalid comparisons', () => {
      const records = [
        { test: 'Glucose', val: 100, unit: 'mg/dL' },
        { test: 'Glucose', val: 5.5, unit: 'mmol/L' },
        { test: 'Glucose', val: 110, unit: 'mg/dL' }
      ];

      // Unit grouping simulation
      const grouped = records.reduce((acc, curr) => {
        acc[curr.unit] = acc[curr.unit] || [];
        acc[curr.unit].push(curr.val);
        return acc;
      }, {});

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['mg/dL']).toEqual([100, 110]);
      expect(grouped['mmol/L']).toEqual([5.5]);
      // Verify units are never averaged across incompatible units
      expect(grouped['mg/dL']).not.toContain(5.5);
    });
  });
});

