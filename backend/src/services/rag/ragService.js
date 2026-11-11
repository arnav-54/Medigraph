import { prisma } from '../../db/prisma.js';
import { embeddingService, cosineSimilarity, generateDeterministicEmbedding } from './embeddingAdapter.js';
import { matchCanonicalLabTest } from '../canonicalLabCatalog.js';
import { logger } from '../../utils/logger.js';

export const MEDICAL_DISCLAIMER = 'This response is synthesized strictly from your uploaded medical records for informational purposes and does NOT constitute medical advice, diagnosis, or treatment recommendations. Always consult a qualified physician or healthcare provider.';

/**
 * Answers questions grounded in the user's uploaded medical records with provenance citations.
 */
export async function queryMedicalAssistant(userId, query) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return {
      answer: 'Please provide a health question related to your uploaded medical records.',
      citations: [],
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  // 1. DETERMINISTIC FAST-PATH FOR EXACT NUMERIC LAB TEST QUESTIONS
  // e.g. "What is my latest hemoglobin?", "What was my fasting blood glucose?"
  const canonicalTest = matchCanonicalLabTest(cleanQuery);
  if (canonicalTest) {
    const latestResult = await prisma.labResult.findFirst({
      where: {
        userId,
        OR: [
          { labTest: { canonicalName: canonicalTest.canonicalName } },
          { testNameRaw: { contains: canonicalTest.canonicalName, mode: 'insensitive' } }
        ]
      },
      orderBy: { testDate: 'desc' },
      include: {
        extractedRecord: {
          include: {
            document: true
          }
        }
      }
    });

    if (latestResult) {
      const doc = latestResult.extractedRecord.document;
      const pageNum = latestResult.extractedRecord.pageNumber;
      const formattedDate = latestResult.testDate.toISOString().slice(0, 10);
      const abnormalNote = latestResult.isAbnormalFlag ? ' (flagged as abnormal in the report)' : '';
      const rangeNote = latestResult.referenceRangeRaw ? ` with a reference range of ${latestResult.referenceRangeRaw} ${latestResult.normalizedUnit}` : '';

      const answer = `According to your report "${doc.originalFilename}" dated ${formattedDate}, your ${canonicalTest.canonicalName} measurement was ${latestResult.rawValue} ${latestResult.normalizedUnit}${rangeNote}${abnormalNote}. Status: ${latestResult.verificationStatus}.`;

      return {
        answer,
        citations: [
          {
            documentId: doc.id,
            filename: doc.originalFilename,
            pageNumber: pageNum,
            excerpt: latestResult.extractedRecord.rawText
          }
        ],
        isDeterministicQuery: true,
        disclaimer: MEDICAL_DISCLAIMER
      };
    }
  }

  // 2. DOCUMENT COUNT / UPLOAD METADATA QUESTIONS
  // e.g. "What reports did I upload?", "How many documents do I have?"
  if (/what reports|list my reports|how many documents|what documents/i.test(cleanQuery)) {
    const docs = await prisma.document.findMany({
      where: { userId, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
      take: 10
    });

    if (docs.length === 0) {
      return {
        answer: 'You have not uploaded any medical records yet. Please upload a report to review your medical history.',
        citations: [],
        disclaimer: MEDICAL_DISCLAIMER
      };
    }

    const docList = docs
      .map(d => `• "${d.originalFilename}" (Uploaded ${d.uploadedAt.toISOString().slice(0, 10)}, status: ${d.processingStatus})`)
      .join('\n');

    return {
      answer: `You currently have ${docs.length} document(s) in your medical records:\n${docList}`,
      citations: docs.map(d => ({
        documentId: d.id,
        filename: d.originalFilename,
        pageNumber: 1,
        excerpt: `Document: ${d.originalFilename}`
      })),
      isDeterministicQuery: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  // 3. SEMANTIC VECTOR & KEYWORD HYBRID RETRIEVAL
  const queryEmbedding = await embeddingService.getEmbedding(cleanQuery);

  const chunks = await prisma.documentChunk.findMany({
    where: { userId },
    include: {
      document: {
        select: {
          id: true,
          originalFilename: true
        }
      }
    },
    take: 50
  });

  // If no chunks exist in user account
  if (chunks.length === 0) {
    return {
      answer: 'Based on the medical documents currently uploaded to your account, there is insufficient evidence to answer this question. No records were found.',
      citations: [],
      insufficientEvidence: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  // Compute similarity scores
  const scoredChunks = chunks.map(chunk => {
    const chunkVector = generateDeterministicEmbedding(chunk.content, 128);
    const score = cosineSimilarity(queryEmbedding, chunkVector);
    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.filter(c => c.score > 0.40).slice(0, 3);

  // If evidence is insufficient, return honest response
  if (topChunks.length === 0) {
    return {
      answer: 'Based on the medical documents currently uploaded to your account, there is insufficient evidence to answer your question. The records do not contain enough verified information regarding this topic.',
      citations: [],
      insufficientEvidence: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  // Build citations
  const citations = topChunks.map(c => ({
    documentId: c.documentId,
    filename: c.document.originalFilename,
    pageNumber: c.pageNumber,
    excerpt: c.content
  }));

  // Context-grounded synthesis
  const contextExcerpts = topChunks.map(c => `[From "${c.document.originalFilename}", Page ${c.pageNumber}]: ${c.content}`).join('\n\n');
  const answer = `Based on your uploaded medical records:\n\n${contextExcerpts}\n\nPlease consult your physician for clinical interpretation.`;

  return {
    answer,
    citations,
    insufficientEvidence: false,
    disclaimer: MEDICAL_DISCLAIMER
  };
}
