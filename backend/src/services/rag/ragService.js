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

  const isHindi = /meri|mera|kya|hai|batao|kaun|kaunsi|mujhe|sehat|ilaj|dawai|karein|jaanch|kripya/i.test(cleanQuery);

  // 1. ABNORMAL / OUT-OF-RANGE LAB VALUES QUERY
  // e.g. "What are my abnormal values?", "Meri abnormal values kya hai?", "Which tests are out of range?"
  if (/abnormal|out of range|elevated|high|asamanya|gadbad|kharab/i.test(cleanQuery)) {
    const abnormalResults = await prisma.labResult.findMany({
      where: {
        userId,
        OR: [
          { isAbnormalFlag: true },
          { isCriticalFlag: true }
        ]
      },
      orderBy: { testDate: 'desc' },
      take: 12,
      include: {
        extractedRecord: {
          include: {
            document: true
          }
        }
      }
    });

    if (abnormalResults.length === 0) {
      const answer = isHindi
        ? 'आपके अपलोड किए गए रिकॉर्ड्स में कोई भी टेस्ट असामान्य (Abnormal) या क्रिटिकल सीमा में नहीं मिला। सभी टेस्ट सामान्य रेंज में दिखाई दे रहे हैं।'
        : 'Based on your uploaded medical records, there are currently no abnormal or out-of-range lab values flagged.';

      return {
        answer,
        citations: [],
        isDeterministicQuery: true,
        disclaimer: MEDICAL_DISCLAIMER
      };
    }

    const items = abnormalResults.map(r => {
      const name = r.testNameRaw || 'Biomarker';
      const val = `${r.rawValue} ${r.rawUnit || ''}`.trim();
      const range = r.referenceRangeRaw ? `(Normal: ${r.referenceRangeRaw})` : '';
      const flag = r.isCriticalFlag ? '🚨 CRITICAL' : '⚠️ ELEVATED';
      return `• ${name}: ${val} ${range} — [${flag}]`;
    }).join('\n');

    let crossInsight = '';
    // Cross-biomarker correlation checks
    const testNames = abnormalResults.map(r => (r.testNameRaw || '').toLowerCase());
    const hasHighGlucose = abnormalResults.some(r => /glucose|sugar|hba1c/i.test(r.testNameRaw || '') && r.numericValue > 120);
    const hasLipidIssue = abnormalResults.some(r => /cholesterol|triglyceride|ldl/i.test(r.testNameRaw || '') && r.numericValue > 150);
    const hasLowHb = abnormalResults.some(r => /hemoglobin|hb/i.test(r.testNameRaw || '') && r.numericValue < 12);

    if (hasHighGlucose && hasLipidIssue) {
      crossInsight = isHindi
        ? '\n\n💡 **विशेष अंतर्दृष्टि (Cross-Biomarker Insight):** आपके ब्लड शुगर और लिपिड/कोलेस्ट्रॉल दोनों में वृद्धि देखी गई है। यह मेटाबॉलिक सिंड्रोम की ओर संकेत कर सकता है। कृपया अपने फिजिशियन से डाइट और लाइफस्टाइल पर चर्चा करें।'
        : '\n\n💡 **Cross-Biomarker Insight:** Both elevated blood glucose and lipid markers are present in your records, which frequently co-occur in metabolic profiles. We recommend reviewing this with your physician for cardiovascular and glycemic lifestyle planning.';
    } else if (hasLowHb) {
      crossInsight = isHindi
        ? '\n\n💡 **विशेष अंतर्दृष्टि (Cross-Biomarker Insight):** हीमोग्लोबिन सामान्य से कम है। यदि थकान या कमजोरी महसूस होती हो, तो डॉक्टर से आयरन और विटामिन बी12 की जांच हेतु परामर्श लें।'
        : '\n\n💡 **Cross-Biomarker Insight:** Lower hemoglobin levels are observed. If you experience fatigue, discuss with your clinician to check serum ferritin and iron stores.';
    }

    const citations = abnormalResults.slice(0, 4).map(r => ({
      documentId: r.extractedRecord?.document?.id,
      filename: r.extractedRecord?.document?.originalFilename || 'Lab Report',
      pageNumber: r.extractedRecord?.pageNumber || 1,
      excerpt: `${r.testNameRaw}: ${r.rawValue} ${r.rawUnit || ''}`
    }));

    const answer = isHindi
      ? `आपकी अपलोड की गई रिपोर्ट्स में निम्नलिखित टेस्ट परिणाम सामान्य सीमा से बाहर मिले हैं:\n\n${items}${crossInsight}\n\nकृपया किसी भी दवा के बदलाव के लिए अपने डॉक्टर से संपर्क करें।`
      : `The following laboratory measurements in your verified records are currently outside standard reference ranges:\n\n${items}${crossInsight}\n\nPlease consult a qualified physician to evaluate these findings.`;

    return {
      answer,
      citations,
      isDeterministicQuery: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  // 2. DETERMINISTIC FAST-PATH FOR EXACT NUMERIC LAB TEST QUESTIONS
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
      const abnormalNote = latestResult.isCriticalFlag
        ? (isHindi ? ' (🚨 अति-आवश्यक सीमा में)' : ' (🚨 flagged as CRITICAL)')
        : latestResult.isAbnormalFlag
        ? (isHindi ? ' (⚠️ सामान्य सीमा से बाहर)' : ' (⚠️ flagged as abnormal)')
        : (isHindi ? ' (✓ सामान्य सुरक्षित सीमा में)' : ' (✓ within normal range)');

      const rangeNote = latestResult.referenceRangeRaw
        ? (isHindi ? ` [सुरक्षित सीमा: ${latestResult.referenceRangeRaw} ${latestResult.normalizedUnit}]` : ` [Reference range: ${latestResult.referenceRangeRaw} ${latestResult.normalizedUnit}]`)
        : '';

      const answer = isHindi
        ? `आपकी रिपोर्ट "${doc.originalFilename}" (${formattedDate}) के अनुसार, आपका ${canonicalTest.canonicalName} परिणाम **${latestResult.rawValue} ${latestResult.normalizedUnit}** था${rangeNote}${abnormalNote}।`
        : `According to your report "${doc.originalFilename}" dated ${formattedDate}, your ${canonicalTest.canonicalName} measurement was **${latestResult.rawValue} ${latestResult.normalizedUnit}**${rangeNote}${abnormalNote}.`;

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
    } else {
      // Test recognized but NOT found in user's records -> Strict zero-hallucination guardrail!
      const answer = isHindi
        ? `यह जानकारी आपकी अपलोड की गई रिपोर्ट्स में नहीं मिली। आपके रिकॉर्ड में "${canonicalTest.canonicalName}" का कोई टेस्ट परिणाम मौजूद नहीं है। यदि आपके पास इसकी रिपोर्ट है, तो कृपया अपलोड करें।`
        : `This information was not found in your uploaded records. We found no test results for "${canonicalTest.canonicalName}" in your medical reports. Please upload the relevant report to track it.`;

      return {
        answer,
        citations: [],
        insufficientEvidence: true,
        disclaimer: MEDICAL_DISCLAIMER
      };
    }
  }

  // 3. DOCUMENT COUNT / UPLOAD METADATA QUESTIONS
  if (/what reports|list my reports|how many documents|what documents|meri reports|kitni report/i.test(cleanQuery)) {
    const docs = await prisma.document.findMany({
      where: { userId, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
      take: 10
    });

    if (docs.length === 0) {
      return {
        answer: isHindi
          ? 'आपने अभी तक कोई मेडिकल रिपोर्ट अपलोड नहीं की है। कृपया नई रिपोर्ट अपलोड करें।'
          : 'You have not uploaded any medical records yet. Please upload a report to review your medical history.',
        citations: [],
        disclaimer: MEDICAL_DISCLAIMER
      };
    }

    const docList = docs
      .map(d => `• "${d.originalFilename}" (${d.uploadedAt.toISOString().slice(0, 10)})`)
      .join('\n');

    const answer = isHindi
      ? `आपके खाते में कुल ${docs.length} मेडिकल रिपोर्ट्स उपलब्ध हैं:\n${docList}`
      : `You currently have ${docs.length} document(s) in your medical records:\n${docList}`;

    return {
      answer,
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

  // 4. SEMANTIC VECTOR & HYBRID RETRIEVAL
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

  if (chunks.length === 0) {
    return {
      answer: isHindi
        ? 'आपके मेडिकल रिकॉर्ड्स में इस सवाल का उत्तर देने के लिए पर्याप्त जानकारी नहीं मिली।'
        : 'Based on the medical documents currently uploaded to your account, there is insufficient evidence to answer this question. No records were found.',
      citations: [],
      insufficientEvidence: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  const scoredChunks = chunks.map(chunk => {
    const chunkVector = generateDeterministicEmbedding(chunk.content, 128);
    const score = cosineSimilarity(queryEmbedding, chunkVector);
    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.filter(c => c.score > 0.40).slice(0, 3);

  if (topChunks.length === 0) {
    return {
      answer: isHindi
        ? 'आपके अपलोड किए गए दस्तावेज़ों में इस विषय के बारे में कोई सत्यापित जानकारी नहीं मिली (Zero-Hallucination Guardrail)।'
        : 'Based on the medical documents currently uploaded to your account, there is insufficient evidence to answer your question. The records do not contain enough verified information regarding this topic.',
      citations: [],
      insufficientEvidence: true,
      disclaimer: MEDICAL_DISCLAIMER
    };
  }

  const citations = topChunks.map(c => ({
    documentId: c.documentId,
    filename: c.document.originalFilename,
    pageNumber: c.pageNumber,
    excerpt: c.content
  }));

  const contextExcerpts = topChunks.map(c => `[From "${c.document.originalFilename}", Page ${c.pageNumber}]: ${c.content}`).join('\n\n');
  const answer = isHindi
    ? `आपकी सत्यापित मेडिकल रिपोर्ट्स के अनुसार:\n\n${contextExcerpts}\n\nचिकित्सीय सलाह के लिए कृपया अपने डॉक्टर से परामर्श लें।`
    : `Based on your uploaded medical records:\n\n${contextExcerpts}\n\nPlease consult your physician for clinical interpretation.`;

  return {
    answer,
    citations,
    insufficientEvidence: false,
    disclaimer: MEDICAL_DISCLAIMER
  };
}
