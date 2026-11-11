import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { ValidationError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Recognized Magic Byte Signatures
const MAGIC_SIGNATURES = [
  {
    type: 'application/pdf',
    ext: '.pdf',
    // %PDF-
    validate: (buf) => buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46
  },
  {
    type: 'image/png',
    ext: '.png',
    // \x89PNG\r\n\x1a\n
    validate: (buf) => buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  },
  {
    type: 'image/jpeg',
    ext: '.jpg',
    // \xFF\xD8\xFF
    validate: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  }
];

/**
 * Validates buffer against authentic file signature magic bytes.
 * Throws ValidationError if signature doesn't match an allowed format.
 */
export function validateFileSignature(buffer, claimedMimeType) {
  if (!buffer || buffer.length === 0) {
    throw new ValidationError('Uploaded file buffer is empty');
  }

  const matched = MAGIC_SIGNATURES.find(sig => sig.validate(buffer));

  if (!matched) {
    throw new ValidationError(
      'Invalid file content. File does not match authentic PDF, PNG, or JPEG binary signatures.'
    );
  }

  // Verify claimed MIME type aligns with binary signature
  const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!validMimes.includes(claimedMimeType.toLowerCase())) {
    throw new ValidationError(`Unsupported MIME type: ${claimedMimeType}`);
  }

  return {
    verifiedMimeType: matched.type,
    canonicalExtension: matched.ext
  };
}

/**
 * Computes SHA-256 cryptographic digest of a file buffer.
 */
export function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Local File Storage Service with tenant directory isolation.
 */
export class LocalStorageService {
  constructor(baseDir = env.UPLOAD_DIR) {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getUserStorageDir(userId) {
    const userDir = path.join(this.baseDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  async saveFile(userId, documentId, buffer, canonicalExtension) {
    const userDir = this.getUserStorageDir(userId);
    const fileName = `${documentId}${canonicalExtension}`;
    const destinationPath = path.join(userDir, fileName);

    await fs.promises.writeFile(destinationPath, buffer);
    logger.info(`Securely saved document to storage`, { userId, documentId });

    return {
      storageKey: path.relative(this.baseDir, destinationPath),
      fullPath: destinationPath
    };
  }

  async getFileBuffer(storageKey) {
    const fullPath = path.join(this.baseDir, storageKey);
    // Path traversal check
    if (!fullPath.startsWith(this.baseDir)) {
      throw new ValidationError('Invalid storage key path traversal attempt');
    }

    if (!fs.existsSync(fullPath)) {
      throw new ValidationError('Requested file does not exist in storage');
    }

    return fs.promises.readFile(fullPath);
  }

  async deleteFile(storageKey) {
    const fullPath = path.join(this.baseDir, storageKey);
    if (fullPath.startsWith(this.baseDir) && fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      logger.info('Deleted document file from storage', { storageKey });
    }
  }
}

export const storageService = new LocalStorageService();

