/**
 * Standard Unit Normalization Engine for Longitudinal Health Intelligence.
 * Automatically converts international lab unit variants into standardized clinical units
 * to ensure graph trajectories remain continuous and non-distorted across disparate laboratories.
 */

export const UNIT_CONVERSIONS = {
  // Blood Glucose (Standard: mg/dL)
  'Fasting Blood Glucose': {
    standardUnit: 'mg/dL',
    conversions: {
      'mmol/L': (val) => Math.round(val * 18.0182 * 10) / 10,
      'mg/dL': (val) => val
    }
  },
  // Total Cholesterol (Standard: mg/dL)
  'Total Cholesterol': {
    standardUnit: 'mg/dL',
    conversions: {
      'mmol/L': (val) => Math.round(val * 38.67 * 10) / 10,
      'mg/dL': (val) => val
    }
  },
  // HDL Cholesterol (Standard: mg/dL)
  'HDL Cholesterol': {
    standardUnit: 'mg/dL',
    conversions: {
      'mmol/L': (val) => Math.round(val * 38.67 * 10) / 10,
      'mg/dL': (val) => val
    }
  },
  // LDL Cholesterol (Standard: mg/dL)
  'LDL Cholesterol': {
    standardUnit: 'mg/dL',
    conversions: {
      'mmol/L': (val) => Math.round(val * 38.67 * 10) / 10,
      'mg/dL': (val) => val
    }
  },
  // Triglycerides (Standard: mg/dL)
  'Triglycerides': {
    standardUnit: 'mg/dL',
    conversions: {
      'mmol/L': (val) => Math.round(val * 88.57 * 10) / 10,
      'mg/dL': (val) => val
    }
  },
  // Vitamin D (Standard: ng/mL)
  'Vitamin D (25-OH)': {
    standardUnit: 'ng/mL',
    conversions: {
      'nmol/L': (val) => Math.round((val / 2.496) * 10) / 10,
      'ng/mL': (val) => val
    }
  },
  // Vitamin B12 (Standard: pg/mL)
  'Vitamin B12': {
    standardUnit: 'pg/mL',
    conversions: {
      'pmol/L': (val) => Math.round(val * 1.355 * 10) / 10,
      'pg/mL': (val) => val
    }
  },
  // Serum Creatinine (Standard: mg/dL)
  'Serum Creatinine': {
    standardUnit: 'mg/dL',
    conversions: {
      'µmol/L': (val) => Math.round((val / 88.4) * 100) / 100,
      'umol/L': (val) => Math.round((val / 88.4) * 100) / 100,
      'mg/dL': (val) => val
    }
  },
  // Total Bilirubin (Standard: mg/dL)
  'Total Bilirubin': {
    standardUnit: 'mg/dL',
    conversions: {
      'µmol/L': (val) => Math.round((val / 17.1) * 100) / 100,
      'umol/L': (val) => Math.round((val / 17.1) * 100) / 100,
      'mg/dL': (val) => val
    }
  },
  // Hemoglobin (Standard: g/dL)
  'Hemoglobin': {
    standardUnit: 'g/dL',
    conversions: {
      'g/L': (val) => Math.round((val / 10) * 10) / 10,
      'mmol/L': (val) => Math.round(val * 1.6114 * 10) / 10,
      'g/dL': (val) => val
    }
  }
};

/**
 * Normalizes a value and its unit to the canonical standard unit.
 */
export function normalizeLabUnit(testName, value, unit) {
  if (value === null || isNaN(value)) return { value, unit };
  const cleanUnit = (unit || '').trim();
  const config = UNIT_CONVERSIONS[testName];

  if (!config) {
    return { value, unit: cleanUnit };
  }

  const converter = config.conversions[cleanUnit];
  if (converter) {
    return {
      value: converter(value),
      unit: config.standardUnit,
      wasConverted: cleanUnit !== config.standardUnit
    };
  }

  return { value, unit: cleanUnit };
}

