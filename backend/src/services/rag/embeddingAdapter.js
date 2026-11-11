import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

/**
 * Deterministic embedding generator for offline testing and synthetic vectors.
 * Generates reproducible unit-normalized 128-dimensional vectors from text.
 */
export function generateDeterministicEmbedding(text, dimension = 128) {
  const clean = (text || '').toLowerCase().trim();
  const vector = new Array(dimension).fill(0);

  // Generate pseudo-random deterministic floats using cryptographic hashing
  const hash = crypto.createHash('sha256').update(clean).digest();

  for (let i = 0; i < dimension; i++) {
    const byte = hash[i % hash.length];
    // Map byte [0..255] to range [-1.0 .. 1.0]
    vector[i] = (byte / 127.5) - 1.0;
  }

  // Normalize to unit length
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => (norm === 0 ? 0 : val / norm));
}

export class EmbeddingService {
  constructor(apiKey = env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.dimension = 128;
  }

  async getEmbedding(text) {
    if (this.apiKey && this.apiKey.length > 10) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'models/embedding-001',
              content: { parts: [{ text }] }
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.embedding?.values) {
            return data.embedding.values;
          }
        }
      } catch {
        // Fall back to deterministic mock
      }
    }

    return generateDeterministicEmbedding(text, this.dimension);
  }
}

export const embeddingService = new EmbeddingService();
