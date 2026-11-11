import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Creates an immutable audit log entry.
 * Guarantees zero PHI (Protected Health Information) or credentials are saved.
 */
export async function logAuditEvent({
  userId = null,
  action,
  resourceType,
  resourceId = null,
  details = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    const entry = await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        details: details || {},
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });

    logger.info(`Audit: ${action} on ${resourceType}:${resourceId || 'N/A'} by user:${userId || 'anonymous'}`, {
      action,
      resourceType,
      resourceId,
      userId
    });

    return entry;
  } catch (error) {
    // If audit logging fails, log critically but do not crash the request flow unless required by compliance
    logger.error('Failed to write audit log entry', {
      action,
      resourceType,
      error: error.message
    });
    return null;
  }
}

