import { matchCanonicalLabTest, parseReferenceRange, determineAbnormalStatus } from './canonicalLabCatalog.js';
import { logger } from '../utils/logger.js';

/**
 * Extracts structured medical data and laboratory results from document pages.
 */
export function extractStructuredMedicalData(pages, documentMetadata = {}) {
  const extractedResults = [];
  let extractedPatientName = null;
  let extractedReportDate = null;
  let extractedProvider = null;

  for (const page of pages) {
    const text = page.rawText || page.text || '';
    const pageNum = page.pageNumber || page.page_number || 1;
    const pageOcrConfidence = page.ocrConfidence || page.ocr_confidence || 1.0;

    // 1. Metadata Extraction
    if (!extractedPatientName) {
      const nameMatch = text.match(/Patient:\s*([A-Za-z\s.]+?)(?=\s*[\|\n]|$)/i);
      if (nameMatch) extractedPatientName = nameMatch[1].trim();
    }

    if (!extractedReportDate) {
      const dateMatch = text.match(/(?:Collected|Date|Report Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      if (dateMatch) extractedReportDate = new Date(dateMatch[1]);
    }

    if (!extractedProvider) {
      const providerMatch = text.match(/(?:METROPOLITAN HEALTH LABORATORY|QUEST DIAGNOSTICS|LABCORP|[A-Z\s]{4,}LABORATORY)/);
      if (providerMatch) extractedProvider = providerMatch[0].trim();
    }

    // 2. Structured Laboratory Table Line Parsing
    // Matches lines like: "Hemoglobin 14.2 g/dL 12.0 - 16.0 NORMAL"
    // or "Fasting Blood Glucose 118 mg/dL 70 - 99 HIGH"
    // or "Total Cholesterol 210 mg/dL < 200 HIGH"
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('---') || trimmed.toLowerCase().startsWith('test name')) {
        continue;
      }

      // Regex matching: (Test Name) (Numeric Value) (Unit) (Reference Range) (Optional Flag)
      const labRegex = /^([A-Za-z0-9\s\-]+?)\s+([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z%\/]+)\s+([<>]?\s*[0-9]+(?:\.[0-9]+)?(?:\s*-\s*[0-9]+(?:\.[0-9]+)?)?)\s*(NORMAL|HIGH|LOW|ABNORMAL|\*|CRITICAL)?$/i;
      const match = trimmed.match(labRegex);

      if (match) {
        const rawTestName = match[1].trim();
        const rawVal = match[2].trim();
        const rawUnit = match[3].trim();
        const rawRange = match[4] ? match[4].trim() : null;
        const sourceFlag = match[5] ? match[5].trim() : null;

        const canonicalTest = matchCanonicalLabTest(rawTestName);
        const numericVal = parseFloat(rawVal);
        const { raw: rangeRaw, low: refLow, high: refHigh } = parseReferenceRange(rawRange);
        const isAbnormal = determineAbnormalStatus(numericVal, refLow, refHigh, sourceFlag);

        // Calculate extraction confidence: high if canonical match + valid unit + within range
        let extractionConfidence = 0.90;
        let isSuspicious = false;

        if (canonicalTest) {
          extractionConfidence += 0.08;
          // Check plausibility bounds
          if (numericVal < canonicalTest.minPlausible || numericVal > canonicalTest.maxPlausible) {
            isSuspicious = true;
            extractionConfidence -= 0.30;
            logger.warn('Physiologically suspicious medical value flagged', {
              testName: rawTestName,
              value: numericVal,
              bounds: [canonicalTest.minPlausible, canonicalTest.maxPlausible]
            });
          }
        }

        extractedResults.push({
          rawText: trimmed,
          sourcePage: pageNum,
          ocrConfidence: pageOcrConfidence,
          extractionConfidence: Math.min(1.0, Math.max(0.1, extractionConfidence)),
          isSuspicious,
          labTestCanonical: canonicalTest ? canonicalTest.canonicalName : null,
          standardCode: canonicalTest ? canonicalTest.standardCode : null,
          category: canonicalTest ? canonicalTest.category : 'General',
          testNameRaw: rawTestName,
          rawValue: rawVal,
          normalizedValue: isNaN(numericVal) ? null : numericVal,
          rawUnit,
          normalizedUnit: canonicalTest && canonicalTest.standardUnit === rawUnit ? rawUnit : rawUnit,
          referenceRangeRaw: rangeRaw,
          refLow,
          refHigh,
          isAbnormalFlag: isAbnormal,
          testDate: extractedReportDate || documentMetadata.uploadedAt || new Date(),
          verificationStatus: isSuspicious || pageOcrConfidence < 0.85 ? 'PENDING_REVIEW' : 'PENDING_REVIEW'
        });
      }
    }
  }

  return {
    patientName: extractedPatientName,
    reportDate: extractedReportDate,
    provider: extractedProvider,
    extractedCount: extractedResults.length,
    results: extractedResults
  };
}
