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
  RBC: {
    canonicalName: 'RBC Count',
    standardCode: '789-8',
    category: 'Hematology',
    standardUnit: 'mil/µL',
    aliases: ['rbc', 'red blood cell', 'red blood cells', 'erythrocyte count'],
    minPlausible: 1.0,
    maxPlausible: 10.0,
    typicalLow: 4.5,
    typicalHigh: 5.9
  },
  WBC: {
    canonicalName: 'WBC Count',
    standardCode: '6690-2',
    category: 'Hematology',
    standardUnit: '/µL',
    aliases: ['wbc', 'white blood cell', 'white blood cells', 'total leukocyte count', 'total leucocyte count', 'tlc'],
    minPlausible: 500,
    maxPlausible: 100000,
    typicalLow: 4000,
    typicalHigh: 11000
  },
  PLATELETS: {
    canonicalName: 'Platelet Count',
    standardCode: '777-3',
    category: 'Hematology',
    standardUnit: '/µL',
    aliases: ['platelets', 'platelet', 'platelet count', 'plt'],
    minPlausible: 5000,
    maxPlausible: 1500000,
    typicalLow: 150000,
    typicalHigh: 450000
  },
  HEMATOCRIT: {
    canonicalName: 'Hematocrit',
    standardCode: '20570-8',
    category: 'Hematology',
    standardUnit: '%',
    aliases: ['hematocrit', 'pcv', 'packed cell volume', 'hematocrit (pcv)'],
    minPlausible: 10.0,
    maxPlausible: 75.0,
    typicalLow: 40.0,
    typicalHigh: 50.0
  },
  FASTING_GLUCOSE: {
    canonicalName: 'Fasting Blood Glucose',
    standardCode: '1558-6',
    category: 'Metabolic',
    standardUnit: 'mg/dL',
    aliases: ['fasting glucose', 'fbg', 'glucose fasting', 'blood sugar fasting', 'fasting blood sugar', 'average blood glucose', 'abg'],
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
    aliases: ['creatinine', 'serum creatinine', 'creat', 'cr', 'creatinine - serum'],
    minPlausible: 0.1,
    maxPlausible: 25.0,
    typicalLow: 0.6,
    typicalHigh: 1.3
  },
  BLOOD_UREA: {
    canonicalName: 'Blood Urea',
    standardCode: '3094-0',
    category: 'Renal',
    standardUnit: 'mg/dL',
    aliases: ['urea', 'blood urea', 'bun', 'blood urea nitrogen (bun)', 'blood urea nitrogen'],
    minPlausible: 2.0,
    maxPlausible: 250.0,
    typicalLow: 15.0,
    typicalHigh: 40.0
  },
  URIC_ACID: {
    canonicalName: 'Uric Acid',
    standardCode: '3084-1',
    category: 'Renal',
    standardUnit: 'mg/dL',
    aliases: ['uric acid', 'serum uric acid'],
    minPlausible: 1.0,
    maxPlausible: 25.0,
    typicalLow: 3.5,
    typicalHigh: 7.2
  },
  CALCIUM: {
    canonicalName: 'Calcium',
    standardCode: '17861-6',
    category: 'Renal',
    standardUnit: 'mg/dL',
    aliases: ['calcium', 'serum calcium', 'total calcium'],
    minPlausible: 4.0,
    maxPlausible: 18.0,
    typicalLow: 8.5,
    typicalHigh: 10.5
  },
  SODIUM: {
    canonicalName: 'Sodium',
    standardCode: '2951-2',
    category: 'Electrolytes',
    standardUnit: 'mmol/L',
    aliases: ['sodium', 'serum sodium', 'na'],
    minPlausible: 90.0,
    maxPlausible: 180.0,
    typicalLow: 135.0,
    typicalHigh: 145.0
  },
  POTASSIUM: {
    canonicalName: 'Potassium',
    standardCode: '2823-3',
    category: 'Electrolytes',
    standardUnit: 'mmol/L',
    aliases: ['potassium', 'serum potassium', 'k'],
    minPlausible: 1.5,
    maxPlausible: 10.0,
    typicalLow: 3.5,
    typicalHigh: 5.2
  },
  CHLORIDE: {
    canonicalName: 'Chloride',
    standardCode: '2075-0',
    category: 'Electrolytes',
    standardUnit: 'mmol/L',
    aliases: ['chloride', 'serum chloride', 'cl'],
    minPlausible: 70.0,
    maxPlausible: 140.0,
    typicalLow: 96.0,
    typicalHigh: 106.0
  },
  SGOT_AST: {
    canonicalName: 'SGOT (AST)',
    standardCode: '1920-8',
    category: 'Hepatic',
    standardUnit: 'U/L',
    aliases: ['sgot', 'ast', 'aspartate aminotransferase', 'aspartate transaminase', 'sgot (ast)'],
    minPlausible: 2.0,
    maxPlausible: 5000.0,
    typicalLow: 10.0,
    typicalHigh: 40.0
  },
  SGPT_ALT: {
    canonicalName: 'SGPT (ALT)',
    standardCode: '1742-6',
    category: 'Hepatic',
    standardUnit: 'U/L',
    aliases: ['sgpt', 'alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt (alt)'],
    minPlausible: 2.0,
    maxPlausible: 5000.0,
    typicalLow: 7.0,
    typicalHigh: 56.0
  },
  TOTAL_BILIRUBIN: {
    canonicalName: 'Total Bilirubin',
    standardCode: '1975-2',
    category: 'Hepatic',
    standardUnit: 'mg/dL',
    aliases: ['total bilirubin', 'bilirubin total', 'bilirubin', 'bilirubin - total'],
    minPlausible: 0.05,
    maxPlausible: 40.0,
    typicalLow: 0.1,
    typicalHigh: 1.2
  },
  DIRECT_BILIRUBIN: {
    canonicalName: 'Direct Bilirubin',
    standardCode: '1968-7',
    category: 'Hepatic',
    standardUnit: 'mg/dL',
    aliases: ['direct bilirubin', 'bilirubin direct', 'bilirubin - direct', 'bilirubin -direct'],
    minPlausible: 0.01,
    maxPlausible: 20.0,
    typicalLow: 0.0,
    typicalHigh: 0.3
  },
  SERUM_ALBUMIN: {
    canonicalName: 'Serum Albumin',
    standardCode: '1751-7',
    category: 'Hepatic',
    standardUnit: 'g/dL',
    aliases: ['albumin', 'serum albumin', 'albumin - serum'],
    minPlausible: 0.5,
    maxPlausible: 8.0,
    typicalLow: 3.5,
    typicalHigh: 5.0
  },
  TOTAL_CHOLESTEROL: {
    canonicalName: 'Total Cholesterol',
    standardCode: '2093-3',
    category: 'Lipid Panel',
    standardUnit: 'mg/dL',
    aliases: ['cholesterol total', 'total cholesterol', 'serum cholesterol'],
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
    aliases: ['hdl', 'hdl cholesterol', 'high-density lipoprotein', 'hdl-c', 'hdl cholesterol - direct'],
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
    aliases: ['ldl', 'ldl cholesterol', 'low-density lipoprotein', 'ldl-c', 'ldl cholesterol - direct'],
    minPlausible: 10.0,
    maxPlausible: 500.0,
    typicalLow: 50.0,
    typicalHigh: 99.0
  },
  TRIGLYCERIDES: {
    canonicalName: 'Triglycerides',
    standardCode: '2571-8',
    category: 'Lipid Panel',
    standardUnit: 'mg/dL',
    aliases: ['triglycerides', 'triglyceride', 'tg'],
    minPlausible: 20.0,
    maxPlausible: 2000.0,
    typicalLow: 40.0,
    typicalHigh: 149.0
  },
  TSH: {
    canonicalName: 'TSH',
    standardCode: '3016-3',
    category: 'Thyroid',
    standardUnit: 'µIU/mL',
    aliases: ['tsh', 'thyroid stimulating hormone', 'thyrotropin', 'tsh - ultrasensitive'],
    minPlausible: 0.01,
    maxPlausible: 100.0,
    typicalLow: 0.4,
    typicalHigh: 4.0
  },
  T3: {
    canonicalName: 'T3',
    standardCode: '3049-4',
    category: 'Thyroid',
    standardUnit: 'ng/dL',
    aliases: ['t3', 'triiodothyronine', 'total t3'],
    minPlausible: 10.0,
    maxPlausible: 600.0,
    typicalLow: 80.0,
    typicalHigh: 200.0
  },
  T4: {
    canonicalName: 'T4',
    standardCode: '3026-2',
    category: 'Thyroid',
    standardUnit: 'µg/dL',
    aliases: ['t4', 'thyroxine', 'total t4'],
    minPlausible: 0.5,
    maxPlausible: 30.0,
    typicalLow: 5.0,
    typicalHigh: 12.0
  },
  VITAMIN_D: {
    canonicalName: 'Vitamin D (25-OH)',
    standardCode: '1989-3',
    category: 'Vitamins',
    standardUnit: 'ng/mL',
    aliases: ['vitamin d', 'vit d', '25-oh vitamin d', '25-hydroxy vitamin d', '25-oh vitamin d (total)'],
    minPlausible: 2.0,
    maxPlausible: 200.0,
    typicalLow: 30.0,
    typicalHigh: 100.0
  },
  VITAMIN_B12: {
    canonicalName: 'Vitamin B12',
    standardCode: '2132-9',
    category: 'Vitamins',
    standardUnit: 'pg/mL',
    aliases: ['vitamin b12', 'vit b12', 'b12', 'cobalamin', 'vitamin b-12'],
    minPlausible: 20.0,
    maxPlausible: 4000.0,
    typicalLow: 200.0,
    typicalHigh: 900.0
  }
};

/**
 * Normalizes a lab test name to its canonical entry if recognized.
 */
export function matchCanonicalLabTest(rawName) {
  if (!rawName) return null;
  const clean = rawName.trim().toLowerCase();
  const cleanNorm = clean.replace(/[\-–—_()]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Skip ratio or calculated compound indices unless matching a dedicated ratio test
  if (clean.includes('ratio') || clean.includes('/') || cleanNorm.startsWith('non ') || cleanNorm.startsWith('vldl ')) {
    return null;
  }

  // First pass: exact matches
  for (const test of Object.values(CANONICAL_LAB_TESTS)) {
    const canonNorm = test.canonicalName.toLowerCase().replace(/[\-–—_()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean === test.canonicalName.toLowerCase() || cleanNorm === canonNorm) return test;

    for (const alias of test.aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[\-–—_()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean === alias || cleanNorm === aliasNorm) {
        return test;
      }
    }
  }

  // Second pass: prefix / suffix matches
  for (const test of Object.values(CANONICAL_LAB_TESTS)) {
    for (const alias of test.aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[\-–—_()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (
        clean.startsWith(alias + ' ') ||
        clean.endsWith(' ' + alias) ||
        cleanNorm.startsWith(aliasNorm + ' ') ||
        cleanNorm.endsWith(' ' + aliasNorm)
      ) {
        return test;
      }
    }
  }

  return null;
}

/**
 * Parses a reference range string into lower and upper numeric bounds.
 * e.g. "12.0 - 16.0" -> { low: 12.0, high: 16.0 }
 * e.g. "13–17 g/dL" -> { low: 13.0, high: 17.0 }
 * e.g. "Below 200 mg/dL" / "< 200" -> { low: null, high: 200.0 }
 * e.g. "Above 40 mg/dL" / "> 40" -> { low: 40.0, high: null }
 */
export function parseReferenceRange(rangeStr) {
  if (!rangeStr) return { raw: null, low: null, high: null };

  const raw = String(rangeStr).trim();

  // Normalize dashes (en-dash, em-dash, hyphen)
  let cleaned = raw
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/,/g, '') // remove commas in numbers like 4,000 -> 4000
    .replace(/(g\/dL|mg\/dL|mil\/µL|\/µL|µIU\/mL|uIU\/mL|ng\/dL|µg\/dL|ug\/dL|ng\/mL|pg\/mL|U\/L|%)/gi, '')
    .trim();

  // Range: 13-17 or 13.0 - 17.0
  const rangeMatch = cleaned.match(/^([0-9.]+)\s*-\s*([0-9.]+)$/);
  if (rangeMatch) {
    return {
      raw,
      low: parseFloat(rangeMatch[1]),
      high: parseFloat(rangeMatch[2])
    };
  }

  // Below / Less than / < / ≤
  const belowMatch = cleaned.match(/(?:below|less than|[<≤])\s*([0-9.]+)/i);
  if (belowMatch) {
    return {
      raw,
      low: null,
      high: parseFloat(belowMatch[1])
    };
  }

  // Above / More than / > / ≥
  const aboveMatch = cleaned.match(/(?:above|greater than|more than|[>≥])\s*([0-9.]+)/i);
  if (aboveMatch) {
    return {
      raw,
      low: parseFloat(aboveMatch[1]),
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

/**
 * Critical Emergency Thresholds requiring immediate physician consultation.
 */
export const CRITICAL_THRESHOLDS = {
  'Potassium': { criticalLow: 2.8, criticalHigh: 6.0, unit: 'mmol/L' },
  'Fasting Blood Glucose': { criticalLow: 50.0, criticalHigh: 250.0, unit: 'mg/dL' },
  'Hemoglobin': { criticalLow: 7.5, criticalHigh: 20.0, unit: 'g/dL' },
  'Platelet Count': { criticalLow: 40000, criticalHigh: 1000000, unit: '/µL' },
  'Sodium': { criticalLow: 120.0, criticalHigh: 160.0, unit: 'mmol/L' },
  'Calcium': { criticalLow: 6.5, criticalHigh: 13.0, unit: 'mg/dL' },
  'Serum Creatinine': { criticalLow: null, criticalHigh: 3.5, unit: 'mg/dL' }
};

export function checkCriticalStatus(canonicalName, numericVal) {
  if (numericVal === null || isNaN(numericVal) || !canonicalName) return false;
  const crit = CRITICAL_THRESHOLDS[canonicalName];
  if (!crit) return false;
  if (crit.criticalLow !== null && numericVal <= crit.criticalLow) return true;
  if (crit.criticalHigh !== null && numericVal >= crit.criticalHigh) return true;
  return false;
}
