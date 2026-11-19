/**
 * Splits document page text into coherent chunks while preserving exact page and document provenance.
 */
export function chunkDocumentPages(pages, documentId, userId, options = {}) {
  const maxChunkLength = options.maxChunkLength || 400; // ~100 words per chunk
  const overlap = options.overlap || 50;
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const text = (page.rawText || page.text || '').trim();
    if (!text) continue;

    const pageNumber = page.pageNumber || page.page_number || 1;

    // Split text into paragraphs or sentences
    const paragraphs = text.split(/\n\s*\n|\n(?=[A-Z0-9\s]{3,}:)/).filter(Boolean);

    for (const para of paragraphs) {
      const cleanPara = para.replace(/\s+/g, ' ').trim();
      if (cleanPara.length <= maxChunkLength) {
        chunks.push({
          documentId,
          userId,
          pageNumber,
          chunkIndex: chunkIndex++,
          content: cleanPara,
          tokenCount: Math.ceil(cleanPara.length / 4)
        });
      } else {
        // Sliding window for long paragraphs
        let start = 0;
        while (start < cleanPara.length) {
          const end = Math.min(start + maxChunkLength, cleanPara.length);
          const chunkText = cleanPara.slice(start, end).trim();
          chunks.push({
            documentId,
            userId,
            pageNumber,
            chunkIndex: chunkIndex++,
            content: chunkText,
            tokenCount: Math.ceil(chunkText.length / 4)
          });
          start += (maxChunkLength - overlap);
        }
      }
    }
  }

  return chunks;
}

