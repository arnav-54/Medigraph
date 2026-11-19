import { prisma } from '../db/prisma.js';
import { extractDocumentPages } from '../services/extractionPipeline.js';
import { extractStructuredMedicalData } from '../services/medicalExtractor.js';
import { persistExtractedResults } from '../services/extractionReviewService.js';
import { logger } from '../utils/logger.js';
import { localFallbackEmitter } from '../queue/documentQueue.js';

/**
 * Idempotently executes document parsing, OCR extraction, and structured medical data extraction.
 */
export async function executeDocumentProcessing(documentId) {
  logger.info('Starting document processing task', { documentId });

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { processingJobs: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (!document) {
    logger.error('Document not found for processing', { documentId });
    return;
  }

  // Idempotency: skip if already completed
  if (['COMPLETED', 'REVIEW_REQUIRED'].includes(document.processingStatus)) {
    logger.info('Document already processed, skipping', {
      documentId,
      status: document.processingStatus
    });
    return;
  }

  const latestJob = (document.processingJobs && document.processingJobs.length > 0)
    ? document.processingJobs[0]
    : null;

  // Mark PROCESSING
  await prisma.$transaction([
    prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'PROCESSING' }
    }),
    ...(latestJob
      ? [
          prisma.processingJob.update({
            where: { id: latestJob.id },
            data: {
              status: 'ACTIVE',
              startedAt: new Date(),
              attempts: { increment: 1 }
            }
          })
        ]
      : [])
  ]);

  try {
    const extractionResult = await extractDocumentPages(document);

    // Save extracted pages inside transaction
    await prisma.$transaction(async (tx) => {
      // Clear any prior partial pages for idempotency
      await tx.documentPage.deleteMany({
        where: { documentId }
      });

      for (const page of extractionResult.pages) {
        await tx.documentPage.create({
          data: {
            documentId,
            pageNumber: page.page_number,
            rawText: page.text,
            ocrConfidence: page.ocr_confidence,
            hasImages: page.has_images,
            width: page.width || null,
            height: page.height || null
          }
        });
      }

      await tx.document.update({
        where: { id: documentId },
        data: {
          pageCount: extractionResult.page_count
        }
      });
    });

    // 2. Structured Medical Data Extraction from Pages
    const structuredData = extractStructuredMedicalData(extractionResult.pages, {
      uploadedAt: document.uploadedAt
    });

    // Persist extracted lab results and high-level medical events
    await persistExtractedResults(document.id, document.userId, structuredData);

    const hasSuspiciousValues = structuredData.results.some(r => r.isSuspicious);
    const finalStatus = (extractionResult.needs_review || hasSuspiciousValues || structuredData.extractedCount > 0)
      ? 'REVIEW_REQUIRED'
      : 'COMPLETED';

    await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: finalStatus }
      }),
      ...(latestJob
        ? [
            prisma.processingJob.update({
              where: { id: latestJob.id },
              data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                metadata: {
                  overallConfidence: extractionResult.overall_confidence,
                  pageCount: extractionResult.page_count,
                  extractedCount: structuredData.extractedCount,
                  durationMs: extractionResult.processing_time_ms
                }
              }
            })
          ]
        : [])
    ]);

    logger.info('Document extraction pipeline succeeded', {
      documentId,
      pageCount: extractionResult.page_count,
      extractedCount: structuredData.extractedCount,
      status: finalStatus
    });
  } catch (error) {
    logger.error('Document processing pipeline failed', {
      documentId,
      error: error.message
    });

    await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: 'FAILED',
          failureReason: error.message
        }
      }),
      ...(latestJob
        ? [
            prisma.processingJob.update({
              where: { id: latestJob.id },
              data: {
                status: 'FAILED',
                lastError: error.message
              }
            })
          ]
        : [])
    ]);
  }
}

// Bind local fallback event listener
localFallbackEmitter.on('process-job', async ({ documentId }) => {
  try {
    await executeDocumentProcessing(documentId);
  } catch (err) {
    logger.error('Error in local fallback job handler', { documentId, error: err.message });
  }
});
