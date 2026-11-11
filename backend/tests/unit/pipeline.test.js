import { describe, it, expect } from 'vitest';
import { fallbackLocalExtract } from '../../src/services/extractionPipeline.js';
import { createSyntheticMedicalReportPDF } from '../../../tests/fixtures/generate_sample_pdf.js';
import { getDocumentQueue } from '../../src/queue/documentQueue.js';

describe('OCR Pipeline & Extraction Fallback (Phase 4)', () => {
  it('extracts text and computes high confidence for clean synthetic medical PDF', () => {
    const pdfBuffer = createSyntheticMedicalReportPDF({
      patientName: 'Jane Doe',
      reportDate: '2024-03-15'
    });

    const mockDoc = {
      id: 'doc-uuid-1111',
      mimeType: 'application/pdf',
      originalFilename: 'test_lab_report.pdf'
    };

    const result = fallbackLocalExtract(pdfBuffer, mockDoc);

    expect(result.document_id).toBe(mockDoc.id);
    expect(result.page_count).toBeGreaterThanOrEqual(1);
    expect(result.overall_confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].text).toContain('Hemoglobin');
    expect(result.pages[0].text).toContain('Fasting Blood Glucose');
  });

  it('marks document as needing review when confidence is below threshold', () => {
    // Buffer with minimal content
    const lowConfidenceBuffer = Buffer.from('%PDF-1.4\nstream\nlow\nendstream\n%%EOF');
    const mockDoc = {
      id: 'doc-low-conf',
      mimeType: 'application/pdf',
      originalFilename: 'scanned_image.pdf'
    };

    const result = fallbackLocalExtract(lowConfidenceBuffer, mockDoc);

    expect(result.overall_confidence).toBeLessThan(0.90);
    expect(result.needs_review).toBe(true);
  });

  it('configures BullMQ queue with exponential retry backoff parameters', () => {
    const queue = getDocumentQueue();
    expect(queue).toBeDefined();
    expect(queue.opts.defaultJobOptions.attempts).toBe(3);
    expect(queue.opts.defaultJobOptions.backoff.type).toBe('exponential');
    expect(queue.opts.defaultJobOptions.backoff.delay).toBe(2000);
  });
});
