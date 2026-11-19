import { matchCanonicalLabTest, parseReferenceRange, determineAbnormalStatus, checkCriticalStatus } from './canonicalLabCatalog.js';
import { normalizeLabUnit } from './unitConverter.js';
import { logger } from '../utils/logger.js';

/**
 * Normalizes date strings like "18 Oct, 2026", "15 November 2026", "2024-03-15", "15/11/2026"
 */
function parseDateFlexible(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

/**
 * Extracts structured medical data and laboratory results from document pages.
 * Supports:
 *  1. Single-line tabular rows (Standard LTR)
 *  2. Multi-line sequential blocks (Test -> Value/Unit -> Range)
 *  3. Inverted Column Streams (Thyrocare, Aarogyam, Dr Lal, SRL, Metropolis)
 *     where Units, Values, and Ranges precede or follow Test Names in PDF streams.
 */
export function extractStructuredMedicalData(pages, documentMetadata = {}) {
  const extractedResults = [];
  const seenCanonical = new Map(); // Map<canonicalName, indexInExtractedResults>

  let extractedPatientName = null;
  let extractedReportDate = null;
  let extractedProvider = null;

  for (const page of pages) {
    const text = page.rawText || page.text || '';
    const pageNum = page.pageNumber || page.page_number || 1;
    const pageOcrConfidence = page.ocrConfidence || page.ocr_confidence || 1.0;

    // Detect summary pages (e.g. "Tests Outside Reference Range" summaries that duplicate later pages)
    const isSummaryPage = text.includes('Tests Outside Reference Range') || text.includes('summary of the parameters with values outside');

    // 1. Metadata Extraction
    if (!extractedPatientName) {
      const nameMatch = text.match(/(?:Patient\s*Name|Patient|Name)\s*:\s*([A-Za-z\s.]+?)(?=\s*[((\n\|]|$)/i) ||
                        text.match(/(?:Patient\s*Name|Patient|Name)\s*\n\s*:\s*([A-Za-z\s.]+?)(?=\s*[(\n\|]|$)/i) ||
                        text.match(/Patient\s*Name\s*\n\s*([A-Za-z\s.]+?)(?=\s*\n|$)/i);
      if (nameMatch) {
        const cleanName = nameMatch[1].trim();
        if (cleanName.length > 2 && !cleanName.toLowerCase().includes('status')) {
          extractedPatientName = cleanName;
        }
      }
    }

    if (!extractedReportDate) {
      const dateMatch = text.match(/(?:Collected|Date|Report\s*Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+,?\s+[0-9]{4})/i) ||
                        text.match(/(?:Collected|Date|Report\s*Date)\s*\n\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+,?\s+[0-9]{4})/i) ||
                        text.match(/Report\s*Date\s*\n\s*([0-9]{1,2}\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      if (dateMatch) {
        const parsed = parseDateFlexible(dateMatch[1]);
        if (parsed) extractedReportDate = parsed;
      }
    }

    if (!extractedProvider) {
      const providerMatch = text.match(/(?:METROPOLITAN HEALTH LABORATORY|QUEST DIAGNOSTICS|LABCORP|THYROCARE|AAROGYAM|[A-Z\s]{4,}LABORATORY)/i);
      if (providerMatch) extractedProvider = providerMatch[0].trim();
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip obvious header, divider, or narrative paragraph lines
      if (line.startsWith('---') || line.toLowerCase().startsWith('test name') || line.length > 150) {
        continue;
      }
      if (line.includes(':') || /method|report|alert|disclaimer|correlation|scan\s*qr|page\s*:/i.test(line)) {
        continue;
      }

      // ------------------------------------------------------------------------
      // Priority 1: Single-line tabular row parser
      // e.g. "Hemoglobin 14.2 g/dL 12.0 - 16.0 NORMAL"
      // or "Total Cholesterol 210 mg/dL < 200 HIGH"
      // ------------------------------------------------------------------------
      const labRegex = /^([A-Za-z0-9\s\-()]+?)\s+([0-9,]+(?:\.[0-9]+)?)\s*([A-Za-z%µ\/\-]+)\s+([<>]?\s*[0-9,.]+(?:\s*[\-–—]\s*[0-9,.]+)?)\s*(NORMAL|HIGH|LOW|ABNORMAL|\*|CRITICAL)?$/i;
      const singleMatch = line.match(labRegex);

      if (singleMatch) {
        const rawTestName = singleMatch[1].trim();
        const rawVal = singleMatch[2].replace(/,/g, '').trim();
        const rawUnit = singleMatch[3].trim();
        const rawRange = singleMatch[4] ? singleMatch[4].trim() : null;
        const sourceFlag = singleMatch[5] ? singleMatch[5].trim() : null;

        const canonicalTest = matchCanonicalLabTest(rawTestName);
        const numericVal = parseFloat(rawVal);
        const { raw: rangeRaw, low: refLow, high: refHigh } = parseReferenceRange(rawRange);
        const isAbnormal = determineAbnormalStatus(numericVal, refLow, refHigh, sourceFlag);

        let extractionConfidence = 0.92;
        let isSuspicious = false;

        if (canonicalTest) {
          extractionConfidence += 0.06;
          if (numericVal < canonicalTest.minPlausible || numericVal > canonicalTest.maxPlausible) {
            isSuspicious = true;
            extractionConfidence -= 0.30;
          }
        }

        const { value: unitNormValue, unit: unitNormUnit } = normalizeLabUnit(canonicalTest ? canonicalTest.canonicalName : rawTestName, numericVal, rawUnit);
        const isCritical = canonicalTest ? checkCriticalStatus(canonicalTest.canonicalName, unitNormValue) : false;

        const record = {
          rawText: line,
          sourcePage: pageNum,
          ocrConfidence: pageOcrConfidence,
          extractionConfidence: Math.min(1.0, Math.max(0.1, extractionConfidence)),
          isSuspicious,
          labTestCanonical: canonicalTest ? canonicalTest.canonicalName : null,
          standardCode: canonicalTest ? canonicalTest.standardCode : null,
          category: canonicalTest ? canonicalTest.category : 'General',
          testNameRaw: rawTestName,
          rawValue: rawVal,
          normalizedValue: isNaN(unitNormValue) ? null : unitNormValue,
          rawUnit,
          normalizedUnit: unitNormUnit || (canonicalTest && canonicalTest.standardUnit ? canonicalTest.standardUnit : rawUnit),
          referenceRangeRaw: rangeRaw || rawRange,
          refLow,
          refHigh,
          isAbnormalFlag: isAbnormal || isCritical,
          isCriticalFlag: isCritical,
          testDate: extractedReportDate || documentMetadata.uploadedAt || new Date(),
          verificationStatus: isSuspicious || pageOcrConfidence < 0.85 ? 'PENDING_REVIEW' : 'PENDING_REVIEW',
          isSummaryPage
        };

        const key = canonicalTest ? canonicalTest.canonicalName : rawTestName;
        if (!seenCanonical.has(key)) {
          seenCanonical.set(key, extractedResults.length);
          extractedResults.push(record);
        } else if (!isSummaryPage) {
          const existingIdx = seenCanonical.get(key);
          if (extractedResults[existingIdx].isSummaryPage) {
            extractedResults[existingIdx] = record;
          }
        }
        continue;
      }

      // ------------------------------------------------------------------------
      // Priority 2: Multi-line Forward or Backward Column Stream
      // Matches standard canonical tests (CBC, Lipid, LFT, KFT, Thyroid, Vitamins)
      // ------------------------------------------------------------------------
      const canonicalMatch = matchCanonicalLabTest(line);
      if (canonicalMatch) {
        let foundValue = null;
        let foundUnit = null;
        let foundRange = null;

        // Strategy 2A: Forward consecutive lines (Test -> Value/Unit -> Range)
        if (i + 1 < lines.length) {
          const next = lines[i + 1];
          const valMatch = next.match(/^([0-9,]+(?:\.[0-9]+)?)\s*([A-Za-z%µ\/\-]+)?$/);
          if (valMatch) {
            foundValue = valMatch[1].replace(/,/g, '');
            foundUnit = valMatch[2] || canonicalMatch.standardUnit;
            if (i + 2 < lines.length && /(?:[0-9.]+\s*[\-–—]\s*[0-9.]+|[<≤>≥]\s*[0-9.]+|below|above|normal)/i.test(lines[i + 2])) {
              foundRange = lines[i + 2];
            }
          }
        }

        // Strategy 2B: Inverted Column Stream (Range -> Unit -> Value -> Method -> Test Name)
        if (!foundValue) {
          for (let offset = 1; offset <= 4; offset++) {
            const prevIdx = i - offset;
            if (prevIdx < 0) break;
            const prev = lines[prevIdx];

            // Strict numeric value
            if (!foundValue && /^[0-9]+(?:\.[0-9]+)?$/.test(prev)) {
              foundValue = prev;
              // Check preceding line for unit
              if (prevIdx - 1 >= 0) {
                const u = lines[prevIdx - 1];
                if (/^(mg\/dL|g\/dL|gm\/dL|ng\/mL|pg\/mL|µIU\/mL|uIU\/mL|U\/L|%|mmol\/L|fL|Ratio|X 10³ \/ µL|X 10\^6\/µL)$/i.test(u)) {
                  foundUnit = u;
                }
              }
            }

            // Strict range
            if (!foundRange && /(?:[0-9.]+\s*[\-–—]\s*[0-9.]+|[<≤>≥]\s*[0-9.]+|below|above|normal)/i.test(prev)) {
              foundRange = prev;
            }
          }

          // Also check subsequent 1-3 lines for range if not found before
          if (!foundRange && i + 1 < lines.length) {
            for (let f = 1; f <= 3; f++) {
              if (i + f < lines.length) {
                const candidate = lines[i + f];
                if (/(?:[0-9.]+\s*[\-–—]\s*[0-9.]+|[<≤>≥]\s*[0-9.]+|below|above|normal)/i.test(candidate)) {
                  foundRange = candidate;
                  break;
                }
              }
            }
          }
        }

        if (foundValue) {
          const numericVal = parseFloat(foundValue);
          const { raw: parsedRangeRaw, low: refLow, high: refHigh } = parseReferenceRange(foundRange);
          const { value: unitNormValue, unit: unitNormUnit } = normalizeLabUnit(canonicalMatch.canonicalName, numericVal, foundUnit || canonicalMatch.standardUnit);
          const isCritical = checkCriticalStatus(canonicalMatch.canonicalName, unitNormValue);
          const isAbnormal = determineAbnormalStatus(unitNormValue, refLow, refHigh, null) || isCritical;

          let extractionConfidence = 0.94;
          let isSuspicious = false;

          if (unitNormValue < canonicalMatch.minPlausible || unitNormValue > canonicalMatch.maxPlausible) {
            isSuspicious = true;
            extractionConfidence -= 0.30;
          }

          const record = {
            rawText: `${line} ${foundValue} ${foundUnit || ''}`.trim(),
            sourcePage: pageNum,
            ocrConfidence: pageOcrConfidence,
            extractionConfidence: Math.min(1.0, Math.max(0.1, extractionConfidence)),
            isSuspicious,
            labTestCanonical: canonicalMatch.canonicalName,
            standardCode: canonicalMatch.standardCode,
            category: canonicalMatch.category,
            testNameRaw: line,
            rawValue: foundValue,
            normalizedValue: isNaN(unitNormValue) ? null : unitNormValue,
            rawUnit: foundUnit || canonicalMatch.standardUnit,
            normalizedUnit: unitNormUnit || canonicalMatch.standardUnit,
            referenceRangeRaw: parsedRangeRaw || foundRange,
            refLow,
            refHigh,
            isAbnormalFlag: isAbnormal,
            isCriticalFlag: isCritical,
            testDate: extractedReportDate || documentMetadata.uploadedAt || new Date(),
            verificationStatus: isSuspicious || pageOcrConfidence < 0.85 ? 'PENDING_REVIEW' : 'PENDING_REVIEW',
            isSummaryPage
          };

          const key = canonicalMatch.canonicalName;
          if (!seenCanonical.has(key)) {
            seenCanonical.set(key, extractedResults.length);
            extractedResults.push(record);
          } else if (!isSummaryPage) {
            const existingIdx = seenCanonical.get(key);
            if (extractedResults[existingIdx].isSummaryPage) {
              extractedResults[existingIdx] = record;
            }
          }
        }
      }
    }
  }

  // Strip temporary internal flags before returning
  const finalized = extractedResults.map(r => {
    const { isSummaryPage, ...rest } = r;
    return rest;
  });

  return {
    patientName: extractedPatientName,
    reportDate: extractedReportDate,
    provider: extractedProvider,
    extractedCount: finalized.length,
    results: finalized
  };
}
