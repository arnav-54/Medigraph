import { prisma } from '../db/prisma.js';
import { validateFileSignature, computeSha256, storageService } from './storageService.js';
import { logAuditEvent } from './auditService.js';
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ingests an uploaded document file:
 * - Validates file signature (magic bytes)
 * - Verifies size limit
 * - Calculates SHA-256
 * - Prevents duplicate uploads for the user
 * - Stores the file securely
 * - Creates Document and ProcessingJob records
 */
export async function uploadDocument({
  userId,
  fileBuffer,
  originalFilename,
  mimeType,
  ipAddress = null,
  userAgent = null
}) {
  const { verifiedMimeType, canonicalExtension } = validateFileSignature(fileBuffer, mimeType);
  const sha256Checksum = computeSha256(fileBuffer);
  const fileSize = fileBuffer.length;

  // Duplicate upload check for the current user
  const existingDoc = await prisma.document.findUnique({
    where: {
      userId_sha256Checksum: {
        userId,
        sha256Checksum
      }
    }
  });

  if (existingDoc && !existingDoc.deletedAt) {
    throw new ConflictError(
      `Duplicate document detected: "${originalFilename}" matches an existing report uploaded on ${existingDoc.uploadedAt.toISOString().slice(0, 10)}.`
    );
  }

  const documentId = uuidv4();
  const { storageKey } = await storageService.saveFile(
    userId,
    documentId,
    fileBuffer,
    canonicalExtension
  );

  const document = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: {
        id: documentId,
        userId,
        originalFilename,
        storageKey,
        mimeType: verifiedMimeType,
        fileSize,
        sha256Checksum,
        processingStatus: 'UPLOADED'
      }
    });

    const job = await tx.processingJob.create({
      data: {
        documentId: doc.id,
        status: 'PENDING',
        metadata: {
          fileSize,
          mimeType: verifiedMimeType,
          originalFilename
        }
      }
    });

    return { doc, job };
  });

  await logAuditEvent({
    userId,
    action: 'DOCUMENT_UPLOAD',
    resourceType: 'DOCUMENT',
    resourceId: document.doc.id,
    details: {
      filename: originalFilename,
      sizeBytes: fileSize,
      mimeType: verifiedMimeType
    },
    ipAddress,
    userAgent
  });

  return {
    document: {
      id: document.doc.id,
      originalFilename: document.doc.originalFilename,
      mimeType: document.doc.mimeType,
      fileSize: document.doc.fileSize,
      processingStatus: document.doc.processingStatus,
      uploadedAt: document.doc.uploadedAt
    },
    job: {
      id: document.job.id,
      status: document.job.status
    }
  };
}

/**
 * Retrieves paginated documents belonging to the authenticated user.
 */
export async function listUserDocuments(userId, { page = 1, limit = 20, status = null }) {
  const skip = (page - 1) * limit;
  const where = {
    userId,
    deletedAt: null,
    ...(status ? { processingStatus: status } : {})
  };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalFilename: true,
        mimeType: true,
        fileSize: true,
        processingStatus: true,
        pageCount: true,
        uploadedAt: true,
        _count: {
          select: {
            extractedRecords: true,
            pages: true
          }
        }
      }
    }),
    prisma.document.count({ where })
  ]);

  return {
    documents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Retrieves a single document with tenant check.
 */
export async function getDocumentById(userId, documentId) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
      deletedAt: null
    },
    include: {
      pages: {
        select: {
          id: true,
          pageNumber: true,
          ocrConfidence: true,
          hasImages: true
        },
        orderBy: { pageNumber: 'asc' }
      },
      processingJobs: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          extractedRecords: true
        }
      }
    }
  });

  if (!document) {
    throw new NotFoundError('Document not found or access denied');
  }

  return document;
}

/**
 * Deletes a document and its storage file.
 */
export async function deleteDocument(userId, documentId, ipAddress = null, userAgent = null) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId, deletedAt: null }
  });

  if (!document) {
    throw new NotFoundError('Document not found or access denied');
  }

  // Soft-delete database entry and clean up storage
  await prisma.document.update({
    where: { id: documentId },
    data: { deletedAt: new Date() }
  });

  await storageService.deleteFile(document.storageKey);

  await logAuditEvent({
    userId,
    action: 'DOCUMENT_DELETE',
    resourceType: 'DOCUMENT',
    resourceId: documentId,
    ipAddress,
    userAgent
  });

  return { success: true, message: 'Document deleted successfully' };
}
