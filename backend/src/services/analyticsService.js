import { prisma } from '../db/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Lists all distinct laboratory tests available in the user's records.
 */
export async function getAvailableLabTests(userId) {
  const tests = await prisma.labResult.findMany({
    where: { userId },
    select: {
      labTestId: true,
      testNameRaw: true,
      normalizedUnit: true,
      verificationStatus: true,
      labTest: {
        select: {
          id: true,
          canonicalName: true,
          category: true,
          standardCode: true,
          defaultUnit: true
        }
      }
    },
    distinct: ['testNameRaw', 'normalizedUnit']
  });

  const seen = new Set();
  const distinctTests = [];
  for (const t of tests) {
    const displayName = t.labTest?.canonicalName || t.testNameRaw;
    const key = `${displayName.toLowerCase()}_${(t.normalizedUnit || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      distinctTests.push({
        labTestId: t.labTest?.id || null,
        displayName,
        rawName: t.testNameRaw,
        category: t.labTest?.category || 'General',
        unit: t.normalizedUnit,
        isCanonical: !!t.labTest
      });
    }
  }

  return distinctTests;
}

/**
 * Computes deterministic trend metrics for a specific laboratory test over time.
 * Enforces unit compatibility and distinguishes verified from unverified measurements.
 */
export async function getLabTestTrend(userId, { testIdentifier, unit = null, onlyVerified = false }) {
  if (!testIdentifier) {
    throw new ValidationError('testIdentifier parameter is required');
  }

  // Find results by canonical ID or testNameRaw
  const where = {
    userId,
    OR: [
      { labTestId: testIdentifier },
      { testNameRaw: { equals: testIdentifier, mode: 'insensitive' } },
      { labTest: { canonicalName: { equals: testIdentifier, mode: 'insensitive' } } }
    ],
    ...(onlyVerified ? { verificationStatus: 'VERIFIED' } : {})
  };

  const results = await prisma.labResult.findMany({
    where,
    orderBy: { testDate: 'asc' },
    include: {
      labTest: true,
      extractedRecord: {
        select: {
          documentId: true,
          pageNumber: true,
          document: {
            select: {
              originalFilename: true
            }
          }
        }
      }
    }
  });

  if (results.length === 0) {
    throw new NotFoundError(`No laboratory records found for "${testIdentifier}"`);
  }

  // Group by unit to enforce unit compatibility rule: "Never compare incompatible units"
  const unitGroups = new Map();
  for (const r of results) {
    const rUnit = r.normalizedUnit || r.rawUnit || 'unknown';
    if (!unitGroups.has(rUnit)) {
      unitGroups.set(rUnit, []);
    }
    unitGroups.get(rUnit).push(r);
  }

  // If user requested a specific unit, use it; otherwise choose the unit with the most measurements
  let targetUnit = unit;
  if (!targetUnit || !unitGroups.has(targetUnit)) {
    let maxCount = 0;
    for (const [u, group] of unitGroups.entries()) {
      if (group.length > maxCount) {
        maxCount = group.length;
        targetUnit = u;
      }
    }
  }

  const selectedSeries = unitGroups.get(targetUnit) || [];

  // Data points formatted for visualization - sorted chronologically (oldest to newest)
  const dataPoints = selectedSeries.map((r) => {
    const d = new Date(r.testDate || Date.now());
    const num = r.normalizedValue !== undefined && r.normalizedValue !== null
      ? r.normalizedValue
      : parseFloat(r.rawValue) || 0;

    return {
      id: r.id,
      testDate: d.toISOString().slice(0, 10),
      timestamp: d.getTime(),
      rawValue: r.rawValue,
      numericValue: num,
      normalizedValue: num,
      unit: targetUnit,
      referenceRangeRaw: r.referenceRangeRaw,
      refLow: r.refLow,
      refHigh: r.refHigh,
      isAbnormalFlag: r.isAbnormalFlag,
      verificationStatus: r.verificationStatus,
      source: {
        documentId: r.extractedRecord?.documentId,
        filename: r.extractedRecord?.document?.originalFilename || 'Document',
        pageNumber: r.extractedRecord?.pageNumber || 1
      }
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

  // Trend statistics calculation (deterministic)
  const numericValues = dataPoints
    .map(p => p.numericValue)
    .filter(v => v !== null && !isNaN(v));

  const count = numericValues.length;
  const insufficientData = count < 2;

  let delta = null;
  let percentChange = null;
  let min = null;
  let max = null;
  let average = null;
  let direction = 'STABLE';

  if (count >= 2) {
    const first = numericValues[0];
    const latest = numericValues[count - 1];
    delta = Math.round((latest - first) * 100) / 100;
    percentChange = first !== 0 ? Math.round(((latest - first) / first) * 1000) / 10 : null;

    min = Math.min(...numericValues);
    max = Math.max(...numericValues);
    average = Math.round((numericValues.reduce((a, b) => a + b, 0) / count) * 100) / 100;

    if (delta > 0.05) direction = 'INCREASING';
    else if (delta < -0.05) direction = 'DECREASING';
    else direction = 'STABLE';
  } else if (count === 1) {
    min = numericValues[0];
    max = numericValues[0];
    average = numericValues[0];
  }

  // Non-negotiable Disclaimer
  const disclaimer = 'Trends and statistical comparisons are deterministic reflections of uploaded reports and do NOT constitute a medical diagnosis or clinical interpretation. Always consult a licensed healthcare professional.';

  return {
    testName: results[0].testNameRaw || results[0].labTest?.canonicalName,
    rawName: results[0].testNameRaw,
    canonicalName: results[0].labTest?.canonicalName,
    category: results[0].labTest?.category || 'General',
    unit: targetUnit,
    availableUnits: Array.from(unitGroups.keys()),
    totalMeasurements: count,
    insufficientData,
    warning: insufficientData
      ? 'At least 2 measurements with compatible units are required to calculate trend trajectories.'
      : null,
    statistics: {
      count: numericValues.length,
      latestValue: numericValues.length > 0 ? numericValues[numericValues.length - 1] : null,
      baselineValue: numericValues.length > 0 ? numericValues[0] : null,
      delta,
      percentChange,
      direction,
      min,
      max,
      average
    },
    series: dataPoints,
    disclaimer
  };
}

/**
 * Computes multi-series summaries for patient dashboard.
 */
export async function getLabTrendsOverview(userId) {
  const available = await getAvailableLabTests(userId);
  const previews = [];

  for (const t of available.slice(0, 10)) {
    try {
      const trend = await getLabTestTrend(userId, {
        testIdentifier: t.labTestId || t.rawName,
        unit: t.unit
      });
      previews.push({
        testName: trend.testName,
        category: trend.category,
        unit: trend.unit,
        count: trend.totalMeasurements,
        latestValue: trend.statistics.latestValue,
        delta: trend.statistics.delta,
        direction: trend.statistics.direction,
        insufficientData: trend.insufficientData
      });
    } catch {
      // Continue if no data
    }
  }

  return previews;
}

