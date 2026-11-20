import { prisma } from '../db/prisma.js';
import { logAuditEvent } from './auditService.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Persists structured extractions into the database with provenance links.
 */
export async function persistExtractedResults(documentId, userId, extractionPayload) {
  const { results, reportDate, provider } = extractionPayload;

  if (!results || results.length === 0) {
    logger.info('No structured lab results found in document', { documentId });
    return [];
  }

  const persisted = await prisma.$transaction(async (tx) => {
    const savedRecords = [];

    // Create high-level MedicalEvent for this lab panel
    const medicalEvent = await tx.medicalEvent.create({
      data: {
        userId,
        documentId,
        eventType: 'LAB_PANEL',
        title: `${provider || 'Clinical'} Laboratory Report`,
        eventDate: reportDate || new Date(),
        description: `Extracted panel containing ${results.length} laboratory measurements.`
      }
    });

    for (const item of results) {
      // Find or create canonical LabTest if recognized
      let labTestId = null;
      if (item.labTestCanonical) {
        const labTest = await tx.labTest.upsert({
          where: { canonicalName: item.labTestCanonical },
          update: {},
          create: {
            canonicalName: item.labTestCanonical,
            standardCode: item.standardCode,
            category: item.category,
            defaultUnit: item.normalizedUnit
          }
        });
        labTestId = labTest.id;
      }

      // Create ExtractedRecord with provenance
      const extractedRecord = await tx.extractedRecord.create({
        data: {
          documentId,
          userId,
          pageNumber: item.sourcePage,
          recordType: 'LAB_TEST',
          rawText: item.rawText,
          extractionConfidence: item.extractionConfidence,
          verificationStatus: item.verificationStatus || 'PENDING_REVIEW'
        }
      });

      // Create detailed LabResult
      const labResult = await tx.labResult.create({
        data: {
          extractedRecordId: extractedRecord.id,
          labTestId,
          userId,
          testNameRaw: item.testNameRaw,
          rawValue: item.rawValue,
          normalizedValue: item.normalizedValue,
          rawUnit: item.rawUnit,
          normalizedUnit: item.normalizedUnit,
          referenceRangeRaw: item.referenceRangeRaw,
          refLow: item.refLow,
          refHigh: item.refHigh,
          isAbnormalFlag: item.isAbnormalFlag,
          testDate: item.testDate,
          verificationStatus: extractedRecord.verificationStatus
        }
      });

      savedRecords.push({ extractedRecord, labResult });
    }

    return savedRecords;
  });

  logger.info(`Persisted ${persisted.length} extracted lab records`, { documentId, userId });
  return persisted;
}

/**
 * Fetches all extracted records for review for a specific document.
 */
export async function getDocumentExtractions(userId, documentId) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId, deletedAt: null }
  });

  if (!document) {
    throw new NotFoundError('Document not found or access denied');
  }

  const extractions = await prisma.extractedRecord.findMany({
    where: { documentId, userId },
    include: {
      labResults: {
        include: {
          labTest: true
        }
      }
    },
    orderBy: [{ pageNumber: 'asc' }, { createdAt: 'asc' }]
  });

  return extractions;
}

/**
 * Allows user to edit an extracted value (marks as EDITED and logs audit).
 */
export async function updateExtractedRecord(userId, extractionId, updates, ipAddress = null, userAgent = null) {
  const existing = await prisma.extractedRecord.findFirst({
    where: { id: extractionId, userId },
    include: { labResults: true }
  });

  if (!existing) {
    throw new NotFoundError('Extracted record not found or access denied');
  }

  const labResult = existing.labResults[0];

  const updated = await prisma.$transaction(async (tx) => {
    const rec = await tx.extractedRecord.update({
      where: { id: extractionId },
      data: {
        verificationStatus: 'EDITED',
        reviewerNotes: updates.reviewerNotes || 'User manual correction'
      }
    });

    let res = null;
    if (labResult) {
      const newNumeric = updates.normalizedValue !== undefined
        ? parseFloat(updates.normalizedValue)
        : (updates.rawValue ? parseFloat(updates.rawValue) : labResult.normalizedValue);

      res = await tx.labResult.update({
        where: { id: labResult.id },
        data: {
          rawValue: updates.rawValue !== undefined ? updates.rawValue : labResult.rawValue,
          normalizedValue: isNaN(newNumeric) ? null : newNumeric,
          rawUnit: updates.rawUnit !== undefined ? updates.rawUnit : labResult.rawUnit,
          normalizedUnit: updates.normalizedUnit !== undefined ? updates.normalizedUnit : labResult.normalizedUnit,
          referenceRangeRaw: updates.referenceRangeRaw !== undefined ? updates.referenceRangeRaw : labResult.referenceRangeRaw,
          verificationStatus: 'EDITED'
        }
      });
    }

    return { rec, res };
  });

  await logAuditEvent({
    userId,
    action: 'EXTRACTION_EDIT',
    resourceType: 'EXTRACTED_RECORD',
    resourceId: extractionId,
    details: {
      previousStatus: existing.verificationStatus,
      newStatus: 'EDITED'
    },
    ipAddress,
    userAgent
  });

  return updated;
}

/**
 * Verifies an extracted record, promoting it for official timeline and analytics.
 */
export async function verifyExtractedRecord(userId, extractionId, ipAddress = null, userAgent = null) {
  const existing = await prisma.extractedRecord.findFirst({
    where: { id: extractionId, userId },
    include: { labResults: true }
  });

  if (!existing) {
    throw new NotFoundError('Extracted record not found or access denied');
  }

  await prisma.$transaction([
    prisma.extractedRecord.update({
      where: { id: extractionId },
      data: { verificationStatus: 'VERIFIED' }
    }),
    prisma.labResult.updateMany({
      where: { extractedRecordId: extractionId },
      data: { verificationStatus: 'VERIFIED' }
    })
  ]);

  await logAuditEvent({
    userId,
    action: 'EXTRACTION_VERIFY',
    resourceType: 'EXTRACTED_RECORD',
    resourceId: extractionId,
    ipAddress,
    userAgent
  });

  return { success: true, message: 'Record verified successfully' };
}

/**
 * Bulk verifies all records for a document.
 */
export async function verifyAllDocumentExtractions(userId, documentId, ipAddress = null, userAgent = null) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId, deletedAt: null }
  });

  if (!document) {
    throw new NotFoundError('Document not found or access denied');
  }

  const records = await prisma.extractedRecord.findMany({
    where: { documentId, userId }
  });
  const recordIds = records.map(r => r.id);

  await prisma.$transaction([
    prisma.extractedRecord.updateMany({
      where: { documentId, userId },
      data: { verificationStatus: 'VERIFIED' }
    }),
    prisma.labResult.updateMany({
      where: { userId, extractedRecordId: { in: recordIds } },
      data: { verificationStatus: 'VERIFIED' }
    }),
    prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'COMPLETED' }
    })
  ]);

  await logAuditEvent({
    userId,
    action: 'EXTRACTION_BULK_VERIFY',
    resourceType: 'DOCUMENT',
    resourceId: documentId,
    ipAddress,
    userAgent
  });

  return { success: true, count: records.length, message: `All ${records.length} extracted records verified` };
}

