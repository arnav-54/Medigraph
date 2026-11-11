/**
 * Catalog of canonical laboratory tests with physiological plausibility bounds and standard units.
 */
export const CANONICAL_LAB_TESTS = {
  HEMOGLOBIN: {
    canonicalName: 'Hemoglobin',
    standardCode: '718-7',
    category: 'Hematology',
    standardUnit: 'g/dL',
    aliases: ['hgb', 'hemoglobin', 'haemoglobin', 'hb'],
    minPlausible: 2.0,
    maxPlausible: 25.0,
    typicalLow: 12.0,
    typicalHigh: 17.5
  },
  FASTING_GLUCOSE: {
    canonicalName: 'Fasting Blood Glucose',
    standardCode: '1558-6',
    category: 'Metabolic',
    standardUnit: 'mg/dL',
    aliases: ['fasting glucose', 'fbg', 'glucose fasting', 'blood sugar fasting', 'fasting blood sugar'],
    minPlausible: 20.0,
    maxPlausible: 1200.0,
    typicalLow: 70.0,
    typicalHigh: 99.0
  },
  HBA1C: {
    canonicalName: 'HbA1c',
    standardCode: '4548-4',
    category: 'Metabolic',
    standardUnit: '%',
    aliases: ['glycated hemoglobin', 'a1c', 'hba1c', 'hemoglobin a1c'],
    minPlausible: 3.0,
    maxPlausible: 20.0,
    typicalLow: 4.0,
    typicalHigh: 5.6
  },
  SERUM_CREATININE: {
    canonicalName: 'Serum Creatinine',
    standardCode: '2160-0',
    category: 'Renal',
    standardUnit: 'mg/dL',
    aliases: ['creatinine', 'serum creatinine', 'creat', 'cr'],
    minPlausible: 0.1,
    maxPlausible: 25.0,
    typicalLow: 0.6,
    typicalHigh: 1.3
  },
  TOTAL_CHOLESTEROL: {
    canonicalName: 'Total Cholesterol',
    standardCode: '2093-3',
    category: 'Lipid Panel',
    standardUnit: 'mg/dL',
    aliases: ['cholesterol total', 'cholesterol', 'total cholesterol'],
    minPlausible: 50.0,
    maxPlausible: 800.0,
    typicalLow: 100.0,
    typicalHigh: 199.0
  },
  HDL_CHOLESTEROL: {
    canonicalName: 'HDL Cholesterol',
    standardCode: '2085-9',
    category: 'Lipid Panel',
    standardUnit: 'mg/dL',
    aliases: ['hdl', 'hdl cholesterol', 'high-density lipoprotein', 'hdl-c'],
    minPlausible: 10.0,
    maxPlausible: 150.0,
    typicalLow: 40.0,
    typicalHigh: 90.0
  },
  LDL_CHOLESTEROL: {
    canonicalName: 'LDL Cholesterol',
    standardCode: '2089-1',
    category: 'Lipid Panel',
    standardUnit: 'mg/dL',
    aliases: ['ldl', 'ldl cholesterol', 'low-density lipoprotein', 'ldl-c'],
    minPlausible: 10.0,
    maxPlausible: 500.0,
    typicalLow: 50.0,
    typicalHigh: 99.0
  }
};

/**
 * Normalizes a lab test name to its canonical entry if recognized.
 */
export function matchCanonicalLabTest(rawName) {
  if (!rawName) return null;
  const clean = rawName.trim().toLowerCase();

  for (const test of Object.values(CANONICAL_LAB_TESTS)) {
    if (clean === test.canonicalName.toLowerCase()) return test;
    for (const alias of test.aliases) {
      if (clean === alias || clean.includes(alias)) {
        return test;
      }
    }
  }

  return null;
}

/**
 * Parses a reference range string into lower and upper numeric bounds.
 * e.g. "12.0 - 16.0" -> { low: 12.0, high: 16.0 }
 * e.g. "< 200" -> { low: null, high: 200.0 }
 * e.g. "> 40" -> { low: 40.0, high: null }
 */
export function parseReferenceRange(rangeStr) {
  if (!rangeStr) return { raw: null, low: null, high: null };

  const raw = rangeStr.trim();
  const rangeMatch = raw.match(/^([0-9.]+)\s*-\s*([0-9.]+)$/);
  if (rangeMatch) {
    return {
      raw,
      low: parseFloat(rangeMatch[1]),
      high: parseFloat(rangeMatch[2])
    };
  }

  const lessThanMatch = raw.match(/^[<≤]\s*([0-9.]+)$/);
  if (lessThanMatch) {
    return {
      raw,
      low: null,
      high: parseFloat(lessThanMatch[1])
    };
  }

  const greaterThanMatch = raw.match(/^[>≥]\s*([0-9.]+)$/);
  if (greaterThanMatch) {
    return {
      raw,
      low: parseFloat(greaterThanMatch[1]),
      high: null
    };
  }

  return { raw, low: null, high: null };
}

/**
 * Deterministically checks if a value is abnormal based on explicit source flag or reference range.
 */
export function determineAbnormalStatus(numericVal, refLow, refHigh, sourceFlag) {
  // If the document explicitly reported abnormal indicator (HIGH, LOW, ABNORMAL, *)
  if (sourceFlag) {
    const flagUpper = sourceFlag.trim().toUpperCase();
    if (['HIGH', 'H', 'LOW', 'L', 'ABNORMAL', 'ABN', '*', 'CRITICAL'].includes(flagUpper)) {
      return true;
    }
  }

  // If no explicit flag, compute deterministically from valid reference bounds
  if (numericVal !== null && !isNaN(numericVal)) {
    if (refLow !== null && numericVal < refLow) return true;
    if (refHigh !== null && numericVal > refHigh) return true;
  }

  return false;
}
