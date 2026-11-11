import { prisma } from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Retrieves a unified chronological medical timeline for the authenticated user.
 * Combines MedicalEvents, Uploaded Documents, and Verified Laboratory panels.
 */
export async function getMedicalTimeline(userId, filters = {}) {
  const {
    startDate = null,
    endDate = null,
    eventType = null,
    search = null,
    verificationStatus = null, // e.g. 'VERIFIED' to filter confirmed records
    page = 1,
    limit = 20
  } = filters;

  const skip = (page - 1) * limit;

  // Base query filters for MedicalEvent
  const eventWhere = {
    userId,
    ...(eventType ? { eventType } : {}),
    ...(startDate || endDate ? {
      eventDate: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };

  const [events, totalEvents] = await Promise.all([
    prisma.medicalEvent.findMany({
      where: eventWhere,
      skip,
      take: limit,
      orderBy: { eventDate: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            originalFilename: true,
            mimeType: true,
            uploadedAt: true
          }
        }
      }
    }),
    prisma.medicalEvent.count({ where: eventWhere })
  ]);

  // Enrich events with verified lab results if event has associated document
  const enrichedEvents = await Promise.all(
    events.map(async (event) => {
      let labResults = [];
      if (event.documentId) {
        const labWhere = {
          userId,
          extractedRecord: { documentId: event.documentId },
          ...(verificationStatus ? { verificationStatus } : {})
        };

        labResults = await prisma.labResult.findMany({
          where: labWhere,
          select: {
            id: true,
            testNameRaw: true,
            rawValue: true,
            normalizedValue: true,
            rawUnit: true,
            normalizedUnit: true,
            referenceRangeRaw: true,
            refLow: true,
            refHigh: true,
            isAbnormalFlag: true,
            testDate: true,
            verificationStatus: true,
            extractedRecord: {
              select: {
                pageNumber: true,
                extractionConfidence: true
              }
            }
          },
          orderBy: { testNameRaw: 'asc' }
        });
      }

      return {
        id: event.id,
        eventType: event.eventType,
        title: event.title,
        eventDate: event.eventDate,
        description: event.description,
        document: event.document,
        labResultsCount: labResults.length,
        labResults,
        createdAt: event.createdAt
      };
    })
  );

  return {
    events: enrichedEvents,
    pagination: {
      page,
      limit,
      total: totalEvents,
      totalPages: Math.ceil(totalEvents / limit)
    }
  };
}

/**
 * Retrieves a single timeline event by ID with full provenance.
 */
export async function getTimelineEventById(userId, eventId) {
  const event = await prisma.medicalEvent.findFirst({
    where: { id: eventId, userId },
    include: {
      document: {
        select: {
          id: true,
          originalFilename: true,
          mimeType: true,
          uploadedAt: true,
          storageKey: true
        }
      }
    }
  });

  if (!event) {
    throw new NotFoundError('Timeline event not found or access denied');
  }

  let labResults = [];
  if (event.documentId) {
    labResults = await prisma.labResult.findMany({
      where: {
        userId,
        extractedRecord: { documentId: event.documentId }
      },
      include: {
        extractedRecord: {
          select: {
            pageNumber: true,
            rawText: true,
            extractionConfidence: true,
            verificationStatus: true
          }
        },
        labTest: true
      },
      orderBy: { testNameRaw: 'asc' }
    });
  }

  return {
    ...event,
    labResults
  };
}
