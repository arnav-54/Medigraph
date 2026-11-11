import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateFileSignature,
  computeSha256,
  LocalStorageService
} from '../../src/services/storageService.js';
import { ValidationError } from '../../src/utils/errors.js';
import fs from 'fs';
import path from 'path';

describe('Storage & File Signature Security (Phase 3)', () => {
  const testStorageDir = './storage/test_uploads';
  let storage;

  beforeEach(() => {
    storage = new LocalStorageService(testStorageDir);
  });

  afterEach(async () => {
    if (fs.existsSync(testStorageDir)) {
      await fs.promises.rm(testStorageDir, { recursive: true, force: true });
    }
  });

  describe('Magic Byte Signature Verification', () => {
    it('accepts authentic PDF file binary header', () => {
      // %PDF-1.4 header bytes
      const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      const result = validateFileSignature(pdfHeader, 'application/pdf');

      expect(result.verifiedMimeType).toBe('application/pdf');
      expect(result.canonicalExtension).toBe('.pdf');
    });

    it('accepts authentic PNG image binary header', () => {
      // \x89PNG\r\n\x1a\n header bytes
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const result = validateFileSignature(pngHeader, 'image/png');

      expect(result.verifiedMimeType).toBe('image/png');
      expect(result.canonicalExtension).toBe('.png');
    });

    it('accepts authentic JPEG image binary header', () => {
      // \xFF\xD8\xFF header bytes
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const result = validateFileSignature(jpegHeader, 'image/jpeg');

      expect(result.verifiedMimeType).toBe('image/jpeg');
      expect(result.canonicalExtension).toBe('.jpg');
    });

    it('rejects executable scripts or disguised payloads with .pdf extension', () => {
      // Shell script disguised as PDF: "#!/bin/bash\nrm -rf /"
      const maliciousScript = Buffer.from('#!/bin/bash\necho "Malicious payload"');

      expect(() => {
        validateFileSignature(maliciousScript, 'application/pdf');
      }).toThrow(ValidationError);
    });

    it('rejects empty file buffers', () => {
      const emptyBuffer = Buffer.from([]);
      expect(() => {
        validateFileSignature(emptyBuffer, 'application/pdf');
      }).toThrow(ValidationError);
    });
  });

  describe('Cryptographic Checksum & Tenant File Isolation', () => {
    it('computes deterministic SHA-256 hash', () => {
      const sampleContent = Buffer.from('Blood Test Report: Hemoglobin 14.2 g/dL');
      const hash1 = computeSha256(sampleContent);
      const hash2 = computeSha256(sampleContent);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 is 64 hex characters
    });

    it('stores file in user-isolated directory and retrieves it accurately', async () => {
      const userId = 'tenant-user-777';
      const docId = 'doc-uuid-999';
      const pdfContent = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x25, 0x25]);

      const { storageKey, fullPath } = await storage.saveFile(userId, docId, pdfContent, '.pdf');

      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fullPath).toContain(userId);

      const retrieved = await storage.getFileBuffer(storageKey);
      expect(Buffer.compare(retrieved, pdfContent)).toBe(0);

      await storage.deleteFile(storageKey);
      expect(fs.existsSync(fullPath)).toBe(false);
    });

    it('detects and prevents directory traversal attacks via storage keys', async () => {
      const traversalKey = '../../etc/passwd';
      await expect(storage.getFileBuffer(traversalKey)).rejects.toThrow(ValidationError);
    });
  });
});
