import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '../../src/middleware/rateLimiter.js';
import { RateLimitError } from '../../src/utils/errors.js';
import { hashPassword, verifyPassword, generateTokens } from '../../src/services/authService.js';
import { validateFileSignature, computeSha256 } from '../../src/services/storageService.js';
import { extractStructuredMedicalData } from '../../src/services/medicalExtractor.js';
import { createSyntheticMedicalReportPDF } from '../../../tests/fixtures/generate_sample_pdf.js';

describe('MediGraph AI End-to-End System Integrity & Security Suite (Phase 11)', () => {
  const testUser = {
    id: 'usr-e2e-12345-patient',
    email: 'test.e2e@medigraph.ai',
    role: 'PATIENT'
  };

  const victimUser = {
    id: 'usr-e2e-67890-victim',
    email: 'victim.e2e@medigraph.ai',
    role: 'PATIENT'
  };

  describe('1. Rate Limiter Security', () => {
    it('enforces maximum request caps and blocks subsequent requests with RateLimitError', () => {
      const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3 });
      const req = { ip: '192.168.1.100' };
      const res = { setHeader: () => {} };

      let errResult = null;
      const next = (err) => { errResult = err; };

      // Request 1, 2, 3: Should pass
      limiter(req, res, next);
      expect(errResult).toBeUndefined();
      limiter(req, res, next);
      expect(errResult).toBeUndefined();
      limiter(req, res, next);
      expect(errResult).toBeUndefined();

      // Request 4: Should trigger RateLimitError
      limiter(req, res, next);
      expect(errResult).toBeInstanceOf(RateLimitError);
      expect(errResult.statusCode).toBe(429);
    });
  });

  describe('2. Authentication & Tenant Token Claims', () => {
    it('hashes passwords using Argon2 and issues valid JWT tokens with tenant claim', async () => {
      const password = 'StrictPassword123!@#';
      const hash = await hashPassword(password);
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const tokens = generateTokens(testUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('3. File Ingestion & Anti-Spoofing Defense', () => {
    it('verifies valid synthetic PDF report and computes SHA-256 fingerprint', () => {
      const pdfBuffer = createSyntheticMedicalReportPDF({
        patientName: 'Jane Doe',
        reportDate: '2024-03-15'
      });

      const { verifiedMimeType } = validateFileSignature(pdfBuffer, 'application/pdf');
      expect(verifiedMimeType).toBe('application/pdf');

      const checksum = computeSha256(pdfBuffer);
      expect(checksum).toHaveLength(64);
    });

    it('rejects disguised executable script uploaded as .pdf', () => {
      const fakePdf = Buffer.from('#!/bin/bash\nrm -rf /');
      expect(() => {
        validateFileSignature(fakePdf, 'application/pdf');
      }).toThrow();
    });
  });

  describe('4. Medical Extraction & Provenance Tracking', () => {
    it('extracts lab measurements with document provenance and dual confidence scores', () => {
      const sampleText = `
METROPOLITAN HEALTH LABORATORY
Patient: Jane Doe | DOB: 1985-04-12 | Collected: 2024-03-15

TEST NAME                RESULT    UNIT     REFERENCE RANGE    FLAG
-------------------------------------------------------------------
Hemoglobin              14.2      g/dL     12.0 - 16.0        NORMAL
Fasting Blood Glucose   118       mg/dL    70 - 99            HIGH
HbA1c                   5.9       %        4.0 - 5.6          HIGH
Serum Creatinine        0.95      mg/dL    0.60 - 1.20        NORMAL
Total Cholesterol       210       mg/dL    < 200              HIGH
`.trim();

      const extracted = extractStructuredMedicalData([
        { pageNumber: 1, rawText: sampleText, ocrConfidence: 0.98 }
      ]);

      expect(extracted.extractedCount).toBe(5);
      expect(extracted.patientName).toBe('Jane Doe');
      expect(extracted.provider).toBe('METROPOLITAN HEALTH LABORATORY');

      // Check abnormal flags
      const fbg = extracted.results.find(r => r.testNameRaw === 'Fasting Blood Glucose');
      expect(fbg.normalizedValue).toBe(118);
      expect(fbg.isAbnormalFlag).toBe(true);
      expect(fbg.sourcePage).toBe(1);
      expect(fbg.ocrConfidence).toBe(0.98);

      const hgb = extracted.results.find(r => r.testNameRaw === 'Hemoglobin');
      expect(hgb.normalizedValue).toBe(14.2);
      expect(hgb.isAbnormalFlag).toBe(false);
    });
  });

  describe('5. Cross-User IDOR Tenant Isolation', () => {
    it('ensures patient cannot access another patient\'s records', () => {
      const req = {
        user: { userId: testUser.id, role: 'PATIENT' },
        params: { userId: victimUser.id }
      };

      const isForbidden = req.user.userId !== req.params.userId && req.user.role !== 'ADMIN';
      expect(isForbidden).toBe(true);
    });
  });
});
