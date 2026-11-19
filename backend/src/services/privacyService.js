import { prisma } from '../db/prisma.js';
import { verifyPassword } from './authService.js';
import { storageService } from './storageService.js';
import { logAuditEvent } from './auditService.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import fs from 'fs';
import path from 'path';

/**
 * Generates a complete GDPR / HIPAA data export bundle for the authenticated user.
 */
export async function exportUserData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: true,
      consents: true,
      documents: {
        where: { deletedAt: null },
        select: {
          id: true,
          originalFilename: true,
          mimeType: true,
          fileSize: true,
          processingStatus: true,
          pageCount: true,
          uploadedAt: true,
          pages: {
            select: {
              pageNumber: true,
              ocrConfidence: true
            }
          }
        }
      },
      labResults: {
        select: {
          testNameRaw: true,
          rawValue: true,
          normalizedValue: true,
          normalizedUnit: true,
          referenceRangeRaw: true,
          isAbnormalFlag: true,
          testDate: true,
          verificationStatus: true
        }
      },
      medicalEvents: {
        select: {
          eventType: true,
          title: true,
          eventDate: true,
          description: true
        }
      },
      generatedSummaries: {
        select: {
          title: true,
          summaryText: true,
          createdAt: true,
          isUserEdited: true
        }
      },
      auditLogs: {
        select: {
          action: true,
          resourceType: true,
          timestamp: true
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await logAuditEvent({
    userId,
    action: 'DATA_EXPORT',
    resourceType: 'USER',
    resourceId: userId
  });

  return {
    exportDate: new Date().toISOString(),
    platform: 'MediGraph AI Longitudinal Document Intelligence',
    user
  };
}

/**
 * Permanently deletes user account, purging all medical records, database entries, and storage files.
 */
export async function deleteUserAccount(userId, password, ipAddress = null, userAgent = null) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid password. Account deletion aborted.');
  }

  // Delete all physical files stored for this user
  const userDir = storageService.getUserStorageDir(userId);
  if (fs.existsSync(userDir)) {
    await fs.promises.rm(userDir, { recursive: true, force: true });
  }

  // Log final deletion event before deleting user
  await logAuditEvent({
    userId,
    action: 'ACCOUNT_DELETE_PURGE',
    resourceType: 'USER',
    resourceId: userId,
    ipAddress,
    userAgent
  });

  // Cascade delete all database records belonging to user
  await prisma.user.delete({
    where: { id: userId }
  });

  return {
    success: true,
    message: 'Your account and all associated medical records have been permanently purged.'
  };
}

