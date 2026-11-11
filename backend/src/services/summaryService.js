import { prisma } from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { logAuditEvent } from './auditService.js';

export const SUMMARY_DISCLAIMER = 'This summary was synthesized automatically from verified records by MediGraph AI. It is intended for personal health organization only and does NOT constitute clinical interpretation or diagnosis. Consult your healthcare provider for medical advice.';

/**
 * Generates an editable longitudinal medical summary across user documents.
 */
export async function generateMedicalSummary(userId, options = {}) {
  const { documentIds = [], timeRangeStart = null, timeRangeEnd = null } = options;

  const docWhere = {
    userId,
    deletedAt: null,
    ...(documentIds.length > 0 ? { id: { in: documentIds } } : {}),
    ...(timeRangeStart || timeRangeEnd ? {
      uploadedAt: {
        ...(timeRangeStart ? { gte: new Date(timeRangeStart) } : {}),
        ...(timeRangeEnd ? { lte: new Date(timeRangeEnd) } : {})
      }
    } : {})
  };

  const documents = await prisma.document.findMany({
    where: docWhere,
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      originalFilename: true,
      uploadedAt: true,
      extractedRecords: {
        where: { verificationStatus: { in: ['VERIFIED', 'PENDING_REVIEW', 'EDITED'] } },
        include: {
          labResults: true
        }
      }
    }
  });

  if (documents.length === 0) {
    throw new NotFoundError('No documents found matching the specified criteria to generate a summary.');
  }

  // Synthesize deterministic facts from documents
  const consultedDocs = documents.map(d => ({
    id: d.id,
    filename: d.originalFilename,
    uploadedAt: d.uploadedAt.toISOString().slice(0, 10)
  }));

  const allLabResults = documents.flatMap(d =>
    d.extractedRecords.flatMap(er =>
      er.labResults.map(lr => ({
        ...lr,
        documentId: d.id,
        filename: d.originalFilename,
        pageNumber: er.pageNumber
      }))
    )
  );

  const abnormalFindings = allLabResults.filter(r => r.isAbnormalFlag);
  const normalFindings = allLabResults.filter(r => !r.isAbnormalFlag);

  // Build structured summary text
  let summaryText = `LONGITUDINAL HEALTH RECORD SUMMARY\n`;
  summaryText += `Generated on: ${new Date().toISOString().slice(0, 10)}\n\n`;
  summaryText += `1. DOCUMENTS REVIEWED (${consultedDocs.length}):\n`;
  consultedDocs.forEach(d => {
    summaryText += `   • "${d.filename}" (Uploaded ${d.uploadedAt})\n`;
  });

  summaryText += `\n2. KEY LABORATORY MEASUREMENTS:\n`;
  if (allLabResults.length > 0) {
    allLabResults.slice(0, 15).forEach(r => {
      const flagStr = r.isAbnormalFlag ? ' [ABNORMAL]' : ' [NORMAL]';
      const rangeStr = r.referenceRangeRaw ? ` (Ref: ${r.referenceRangeRaw} ${r.normalizedUnit || ''})` : '';
      summaryText += `   • ${r.testNameRaw}: ${r.rawValue} ${r.normalizedUnit || ''}${rangeStr}${flagStr} (Source: "${r.filename}", Pg ${r.pageNumber})\n`;
    });
  } else {
    summaryText += `   • No individual laboratory values extracted.\n`;
  }

  summaryText += `\n3. NOTABLE OBSERVATIONS & ELEVATED VALUES:\n`;
  if (abnormalFindings.length > 0) {
    abnormalFindings.forEach(r => {
      summaryText += `   • ${r.testNameRaw} was recorded at ${r.rawValue} ${r.normalizedUnit || ''} on ${r.testDate.toISOString().slice(0, 10)}.\n`;
    });
  } else {
    summaryText += `   • All recorded values fall within their respective laboratory reference ranges.\n`;
  }

  summaryText += `\n4. MISSING OR UNCERTAIN INFORMATION:\n`;
  const pendingReview = allLabResults.filter(r => r.verificationStatus === 'PENDING_REVIEW');
  if (pendingReview.length > 0) {
    summaryText += `   • ${pendingReview.length} measurement(s) remain pending user verification.\n`;
  } else {
    summaryText += `   • All included measurements have been reviewed and verified.\n`;
  }

  const summary = await prisma.generatedSummary.create({
    data: {
      userId,
      title: `Health Summary (${consultedDocs.length} Reports)`,
      summaryText,
      timeRangeStart: timeRangeStart ? new Date(timeRangeStart) : null,
      timeRangeEnd: timeRangeEnd ? new Date(timeRangeEnd) : null,
      documentsIncluded: consultedDocs.map(d => d.id),
      isUserEdited: false,
      disclaimer: SUMMARY_DISCLAIMER
    }
  });

  await logAuditEvent({
    userId,
    action: 'SUMMARY_GENERATE',
    resourceType: 'GENERATED_SUMMARY',
    resourceId: summary.id
  });

  return summary;
}

export async function listUserSummaries(userId) {
  return prisma.generatedSummary.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSummaryById(userId, summaryId) {
  const summary = await prisma.generatedSummary.findFirst({
    where: { id: summaryId, userId }
  });
  if (!summary) throw new NotFoundError('Summary not found or access denied');
  return summary;
}

export async function updateUserSummary(userId, summaryId, updates) {
  const existing = await prisma.generatedSummary.findFirst({
    where: { id: summaryId, userId }
  });
  if (!existing) throw new NotFoundError('Summary not found or access denied');

  return prisma.generatedSummary.update({
    where: { id: summaryId },
    data: {
      title: updates.title || existing.title,
      summaryText: updates.summaryText || existing.summaryText,
      isUserEdited: true
    }
  });
}
