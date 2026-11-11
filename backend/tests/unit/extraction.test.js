import { describe, it, expect } from 'vitest';
import {
  matchCanonicalLabTest,
  parseReferenceRange,
  determineAbnormalStatus
} from '../../src/services/canonicalLabCatalog.js';
import { extractStructuredMedicalData } from '../../src/services/medicalExtractor.js';

describe('Structured Medical Extraction & Validation (Phase 5)', () => {
  describe('Canonical Lab Catalog & Range Parsing', () => {
    it('matches common lab aliases to canonical definitions', () => {
      const hgb = matchCanonicalLabTest('HGB');
      expect(hgb).toBeDefined();
      expect(hgb.canonicalName).toBe('Hemoglobin');
      expect(hgb.standardUnit).toBe('g/dL');

      const fbg = matchCanonicalLabTest('Fasting Blood Glucose');
      expect(fbg.canonicalName).toBe('Fasting Blood Glucose');
      expect(fbg.category).toBe('Metabolic');

      const a1c = matchCanonicalLabTest('A1C');
      expect(a1c.canonicalName).toBe('HbA1c');
    });

    it('parses two-sided reference range "12.0 - 16.0"', () => {
      const range = parseReferenceRange('12.0 - 16.0');
      expect(range.low).toBe(12.0);
      expect(range.high).toBe(16.0);
    });

    it('parses one-sided upper limit range "< 200"', () => {
      const range = parseReferenceRange('< 200');
      expect(range.low).toBeNull();
      expect(range.high).toBe(200.0);
    });

    it('parses one-sided lower limit range "> 40"', () => {
      const range = parseReferenceRange('> 40');
      expect(range.low).toBe(40.0);
      expect(range.high).toBeNull();
    });

    it('deterministically calculates abnormal status', () => {
      // Explicit flag from source
      expect(determineAbnormalStatus(118, 70, 99, 'HIGH')).toBe(true);
      expect(determineAbnormalStatus(14.2, 12, 16, 'NORMAL')).toBe(false);

      // No explicit flag, but value exceeds high bound
      expect(determineAbnormalStatus(118, 70, 99, null)).toBe(true);

      // Value within bounds
      expect(determineAbnormalStatus(85, 70, 99, null)).toBe(false);
    });
  });

  describe('Structured Medical Data Extractor', () => {
    const samplePageText = `
METROPOLITAN HEALTH LABORATORY
Patient: Jane Doe | DOB: 1985-04-12 | Collected: 2024-03-15

TEST NAME                RESULT    UNIT     REFERENCE RANGE    FLAG
-------------------------------------------------------------------
Hemoglobin              14.2      g/dL     12.0 - 16.0        NORMAL
Fasting Blood Glucose   118       mg/dL    70 - 99            HIGH
HbA1c                   5.9       %        4.0 - 5.6          HIGH
Serum Creatinine        0.95      mg/dL    0.60 - 1.20        NORMAL
Total Cholesterol       210       mg/dL    < 200              HIGH
HDL Cholesterol         55        mg/dL    > 40               NORMAL
LDL Cholesterol         132       mg/dL    < 100              HIGH
`.trim();

    it('extracts structured results retaining full provenance and confidence', () => {
      const pages = [
        {
          pageNumber: 1,
          rawText: samplePageText,
          ocrConfidence: 0.98
        }
      ];

      const extraction = extractStructuredMedicalData(pages);

      expect(extraction.patientName).toBe('Jane Doe');
      expect(extraction.provider).toBe('METROPOLITAN HEALTH LABORATORY');
      expect(extraction.extractedCount).toBe(7);

      const hgb = extraction.results.find(r => r.testNameRaw === 'Hemoglobin');
      expect(hgb).toBeDefined();
      expect(hgb.normalizedValue).toBe(14.2);
      expect(hgb.rawUnit).toBe('g/dL');
      expect(hgb.refLow).toBe(12.0);
      expect(hgb.refHigh).toBe(16.0);
      expect(hgb.isAbnormalFlag).toBe(false);
      expect(hgb.sourcePage).toBe(1);
      expect(hgb.ocrConfidence).toBe(0.98);
      expect(hgb.extractionConfidence).toBeGreaterThanOrEqual(0.95);

      const fbg = extraction.results.find(r => r.testNameRaw === 'Fasting Blood Glucose');
      expect(fbg.normalizedValue).toBe(118);
      expect(fbg.isAbnormalFlag).toBe(true);
    });

    it('flags physiologically suspicious or impossible values and lowers extraction confidence', () => {
      const suspiciousPage = [
        {
          pageNumber: 1,
          rawText: 'Hemoglobin 0.2 g/dL 12.0 - 16.0 CRITICAL',
          ocrConfidence: 0.95
        }
      ];

      const extraction = extractStructuredMedicalData(suspiciousPage);
      expect(extraction.results).toHaveLength(1);

      const result = extraction.results[0];
      expect(result.isSuspicious).toBe(true);
      expect(result.extractionConfidence).toBeLessThan(0.80);
      expect(result.verificationStatus).toBe('PENDING_REVIEW');
    });
  });
});
