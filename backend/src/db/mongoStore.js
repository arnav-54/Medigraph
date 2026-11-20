import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Ensure DNS SRV lookups work reliably on all macOS/WiFi networks for mongodb+srv
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if permissions or platform restricts DNS override
}

let client = null;
let db = null;
let isConnected = false;

export async function connectMongo(uri = env.MONGODB_URI || env.DATABASE_URL) {
  if (isConnected && db) return db;

  try {
    const mongoUri = uri.startsWith('mongodb') ? uri : 'mongodb://127.0.0.1:27017/medigraph_db';
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    await client.connect();
    db = client.db('medigraph_db');
    await db.command({ ping: 1 });
    isConnected = true;
    logger.info(`Connected to MongoDB database: ${mongoUri}`);

    // Create indexes and seed initial data if needed
    await initMongoCollections();
    return db;
  } catch (err) {
    isConnected = false;
    db = null;
    throw err;
  }
}

export function isMongoConnected() {
  return isConnected && db !== null;
}

export function getDb() {
  return db;
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    isConnected = false;
    db = null;
  }
}

async function initMongoCollections() {
  if (!db) return;

  try {
    // Ensure primary unique indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await db.collection('documents').createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection('labTests').createIndex({ canonicalName: 1 }, { unique: true }).catch(() => {});
    await db.collection('labResults').createIndex({ userId: 1, testDate: -1 }).catch(() => {});
  } catch (err) {
    logger.warn(`Mongo index warning: ${err.message}`);
  }
}

/**
 * MongoDB Adapter compatible with Prisma query interface
 */
export const mongoDb = {
  user: {
    findUnique: async ({ where }) => {
      if (!db) return null;
      const query = {};
      if (where.email) query.email = where.email.toLowerCase();
      if (where.id) query.id = where.id;
      return db.collection('users').findOne(query, { projection: { _id: 0 } });
    },
    findMany: async () => {
      if (!db) return [];
      return db.collection('users').find({}, { projection: { _id: 0 } }).toArray();
    },
    create: async ({ data }) => {
      const newUser = {
        id: data.id || uuidv4(),
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role || 'PATIENT',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: data.profile?.create ? { id: uuidv4(), ...data.profile.create } : null,
        consents: data.consents?.create || []
      };
      await db.collection('users').insertOne({ ...newUser });
      return newUser;
    },
    update: async ({ where, data }) => {
      if (!db) return null;
      await db.collection('users').updateOne(
        { id: where.id },
        { $set: { ...data, updatedAt: new Date().toISOString() } }
      );
      return db.collection('users').findOne({ id: where.id }, { projection: { _id: 0 } });
    },
    delete: async ({ where }) => {
      if (!db) return { success: false };
      await db.collection('users').deleteOne({ id: where.id });
      return { success: true };
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('users').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  document: {
    findUnique: async ({ where, include }) => {
      if (!db) return null;
      let query = {};
      if (where.id) query.id = where.id;
      if (where.userId_sha256Checksum) {
        query.userId = where.userId_sha256Checksum.userId;
        query.sha256Checksum = where.userId_sha256Checksum.sha256Checksum;
      }
      const doc = await db.collection('documents').findOne(query, { projection: { _id: 0 } });
      if (!doc) return null;

      const res = { ...doc };
      if (include?.processingJobs) {
        res.processingJobs = await db.collection('processingJobs')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .toArray();
      }
      if (include?.pages) {
        res.pages = await db.collection('documentPages')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .toArray();
      }
      if (include?.extractedRecords) {
        res.extractedRecords = await db.collection('extractedRecords')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .toArray();
      }
      return res;
    },
    findFirst: async ({ where, include }) => {
      if (!db) return null;
      const query = {};
      if (where?.id) query.id = where.id;
      if (where?.userId) query.userId = where.userId;
      if (where?.deletedAt === null) query.deletedAt = null;

      const doc = await db.collection('documents').findOne(query, { projection: { _id: 0 } });
      if (!doc) return null;

      const res = { ...doc };
      if (include?.processingJobs) {
        res.processingJobs = await db.collection('processingJobs')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .toArray();
      }
      if (include?.pages) {
        res.pages = await db.collection('documentPages')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .toArray();
      }
      if (include?.extractedRecords) {
        res.extractedRecords = await db.collection('extractedRecords')
          .find({ documentId: doc.id }, { projection: { _id: 0 } })
          .toArray();
      }
      return res;
    },
    count: async ({ where } = {}) => {
      if (!db) return 0;
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.deletedAt === null) query.deletedAt = null;
      if (where?.processingStatus) query.processingStatus = where.processingStatus;
      return db.collection('documents').countDocuments(query);
    },
    findMany: async ({ where, skip = 0, take = 50, include }) => {
      if (!db) return [];
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.deletedAt === null) query.deletedAt = null;
      if (where?.processingStatus) query.processingStatus = where.processingStatus;

      const docs = await db.collection('documents')
        .find(query, { projection: { _id: 0 } })
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(take)
        .toArray();

      return Promise.all(docs.map(async (d) => {
        const extractedCount = await db.collection('extractedRecords').countDocuments({ documentId: d.id });
        const pagesCount = await db.collection('documentPages').countDocuments({ documentId: d.id });
        const res = {
          ...d,
          _count: {
            extractedRecords: extractedCount,
            pages: pagesCount
          }
        };
        if (include?.extractedRecords) {
          const recs = await db.collection('extractedRecords').find({ documentId: d.id }, { projection: { _id: 0 } }).toArray();
          res.extractedRecords = await Promise.all(recs.map(async (er) => {
            const lrs = await db.collection('labResults').find({ extractedRecordId: er.id }, { projection: { _id: 0 } }).toArray();
            return { ...er, labResults: lrs };
          }));
        }
        return res;
      }));
    },
    create: async ({ data }) => {
      const doc = {
        id: data.id || uuidv4(),
        ...data,
        uploadedAt: data.uploadedAt ? new Date(data.uploadedAt).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      };
      await db.collection('documents').insertOne({ ...doc });
      return doc;
    },
    update: async ({ where, data }) => {
      if (!db) return null;
      await db.collection('documents').updateOne(
        { id: where.id },
        { $set: { ...data, updatedAt: new Date().toISOString() } }
      );
      return db.collection('documents').findOne({ id: where.id }, { projection: { _id: 0 } });
    },
    count: async ({ where } = {}) => {
      if (!db) return 0;
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.deletedAt === null) query.deletedAt = null;
      if (where?.processingStatus) query.processingStatus = where.processingStatus;
      return db.collection('documents').countDocuments(query);
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('documents').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  extractedRecord: {
    create: async ({ data }) => {
      const rec = {
        id: data.id || uuidv4(),
        documentId: data.documentId,
        userId: data.userId,
        pageNumber: data.pageNumber || 1,
        recordType: data.recordType || 'LAB_TEST',
        rawText: data.rawText || '',
        extractionConfidence: data.extractionConfidence || 0.95,
        verificationStatus: data.verificationStatus || 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      };
      await db.collection('extractedRecords').insertOne({ ...rec });

      if (data.labResults?.create) {
        const resultsToCreate = Array.isArray(data.labResults.create) ? data.labResults.create : [data.labResults.create];
        for (const lr of resultsToCreate) {
          await mongoDb.labResult.create({
            data: {
              ...lr,
              extractedRecordId: rec.id,
              userId: data.userId
            }
          });
        }
      }
      return rec;
    },
    findMany: async ({ where, include, orderBy }) => {
      if (!db) return [];
      const query = {};
      if (where?.documentId) query.documentId = where.documentId;
      if (where?.userId) query.userId = where.userId;

      let records = await db.collection('extractedRecords')
        .find(query, { projection: { _id: 0 } })
        .toArray();

      if (include?.labResults) {
        records = await Promise.all(records.map(async (r) => {
          const labResults = await db.collection('labResults')
            .find({ extractedRecordId: r.id }, { projection: { _id: 0 } })
            .toArray();

          const labResultsWithTest = await Promise.all(labResults.map(async (lr) => {
            const labTest = lr.labTestId
              ? await db.collection('labTests').findOne({ id: lr.labTestId }, { projection: { _id: 0 } })
              : null;
            return { ...lr, labTest };
          }));

          return { ...r, labResults: labResultsWithTest };
        }));
      }

      if (include?.document) {
        records = await Promise.all(records.map(async (r) => {
          const document = await db.collection('documents').findOne({ id: r.documentId }, { projection: { _id: 0 } });
          return { ...r, document };
        }));
      }

      return records;
    },
    findFirst: async ({ where, include }) => {
      if (!db) return null;
      const rec = await db.collection('extractedRecords').findOne(where || {}, { projection: { _id: 0 } });
      if (!rec) return null;
      return rec;
    },
    update: async ({ where, data }) => {
      if (!db) return null;
      await db.collection('extractedRecords').updateOne(
        { id: where.id },
        { $set: data }
      );
      return db.collection('extractedRecords').findOne({ id: where.id }, { projection: { _id: 0 } });
    },
    updateMany: async ({ where, data }) => {
      if (!db) return { count: 0 };
      const query = {};
      if (where?.documentId) query.documentId = where.documentId;
      if (where?.userId) query.userId = where.userId;
      if (where?.id) query.id = typeof where.id === 'object' && where.id.in ? { $in: where.id.in } : where.id;
      const res = await db.collection('extractedRecords').updateMany(query, { $set: data });
      return { count: res.modifiedCount };
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('extractedRecords').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  labResult: {
    create: async ({ data }) => {
      const numVal = data.normalizedValue !== undefined
        ? data.normalizedValue
        : parseFloat(data.rawValue) || null;

      const lr = {
        id: data.id || uuidv4(),
        extractedRecordId: data.extractedRecordId,
        labTestId: data.labTestId || null,
        userId: data.userId,
        testNameRaw: data.testNameRaw || 'Biomarker',
        rawValue: String(data.rawValue || ''),
        normalizedValue: numVal,
        rawUnit: data.rawUnit || '',
        normalizedUnit: data.normalizedUnit || data.rawUnit || '',
        referenceRangeRaw: data.referenceRangeRaw || null,
        refLow: data.refLow ?? null,
        refHigh: data.refHigh ?? null,
        isAbnormalFlag: Boolean(data.isAbnormalFlag),
        isCriticalFlag: Boolean(data.isCriticalFlag),
        testDate: data.testDate ? new Date(data.testDate).toISOString() : new Date().toISOString(),
        verificationStatus: data.verificationStatus || 'PENDING_REVIEW'
      };
      await db.collection('labResults').insertOne({ ...lr });
      return lr;
    },
    findFirst: async ({ where, include, orderBy }) => {
      if (!db) return null;
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.testNameRaw) query.testNameRaw = where.testNameRaw;
      if (where?.labTestId) query.labTestId = where.labTestId;

      const sortOpt = orderBy?.testDate === 'desc' ? { testDate: -1 } : { testDate: 1 };
      const r = await db.collection('labResults')
        .findOne(query, { projection: { _id: 0 }, sort: sortOpt });

      if (!r) return null;

      const res = { ...r };
      if (include?.extractedRecord) {
        const er = await db.collection('extractedRecords').findOne({ id: r.extractedRecordId }, { projection: { _id: 0 } });
        if (er && include.extractedRecord.include?.document) {
          er.document = await db.collection('documents').findOne({ id: er.documentId }, { projection: { _id: 0 } });
        }
        res.extractedRecord = er;
      }
      return res;
    },
    findMany: async ({ where, include, orderBy, take }) => {
      if (!db) return [];
      let query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.isAbnormalFlag !== undefined) query.isAbnormalFlag = where.isAbnormalFlag;
      if (where?.isCriticalFlag !== undefined) query.isCriticalFlag = where.isCriticalFlag;
      if (where?.verificationStatus) query.verificationStatus = where.verificationStatus;
      if (where?.labTestId) query.labTestId = where.labTestId;

      // Handle extractedRecord filter (e.g., extractedRecord: { documentId: event.documentId })
      if (where?.extractedRecord?.documentId) {
        const matchingRecs = await db.collection('extractedRecords')
          .find({ documentId: where.extractedRecord.documentId }, { projection: { id: 1 } })
          .toArray();
        query.extractedRecordId = { $in: matchingRecs.map(r => r.id) };
      } else if (where?.extractedRecordId) {
        query.extractedRecordId = where.extractedRecordId;
      }

      // Support OR queries e.g. { OR: [ { labTestId }, { testNameRaw }, { isAbnormalFlag: true }, { isCriticalFlag: true } ] }
      if (where?.OR && Array.isArray(where.OR)) {
        const orConditions = [];
        for (const cond of where.OR) {
          if (cond.isAbnormalFlag !== undefined) {
            orConditions.push({ isAbnormalFlag: cond.isAbnormalFlag });
          }
          if (cond.isCriticalFlag !== undefined) {
            orConditions.push({ isCriticalFlag: cond.isCriticalFlag });
          }
          if (cond.labTestId) {
            orConditions.push({ labTestId: cond.labTestId });
          }
          if (cond.testNameRaw) {
            const rawVal = typeof cond.testNameRaw === 'object' ? cond.testNameRaw.equals : cond.testNameRaw;
            if (rawVal) {
              orConditions.push({ testNameRaw: { $regex: new RegExp(`^${rawVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
            }
          }
          if (cond.labTest?.canonicalName) {
            const canonVal = typeof cond.labTest.canonicalName === 'object' ? cond.labTest.canonicalName.equals : cond.labTest.canonicalName;
            if (canonVal) {
              const matchingTests = await db.collection('labTests')
                .find({ canonicalName: { $regex: new RegExp(`^${canonVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }, { projection: { id: 1 } })
                .toArray();
              if (matchingTests.length > 0) {
                orConditions.push({ labTestId: { $in: matchingTests.map(t => t.id) } });
              }
            }
          }
        }
        if (orConditions.length > 0) {
          query.$or = orConditions;
        }
      }

      const sortOpt = orderBy?.testDate === 'desc' ? { testDate: -1 } : { testDate: 1 };
      let cursor = db.collection('labResults')
        .find(query, { projection: { _id: 0 } })
        .sort(sortOpt);

      if (take && typeof take === 'number') {
        cursor = cursor.limit(take);
      }

      let results = await cursor.toArray();

      if (include?.extractedRecord) {
        results = await Promise.all(results.map(async (r) => {
          const er = await db.collection('extractedRecords').findOne({ id: r.extractedRecordId }, { projection: { _id: 0 } });
          if (er && include.extractedRecord.include?.document) {
            er.document = await db.collection('documents').findOne({ id: er.documentId }, { projection: { _id: 0 } });
          }
          return { ...r, extractedRecord: er };
        }));
      }

      if (include?.labTest) {
        results = await Promise.all(results.map(async (r) => {
          const labTest = r.labTestId
            ? await db.collection('labTests').findOne({ id: r.labTestId }, { projection: { _id: 0 } })
            : null;
          return { ...r, labTest };
        }));
      }

      return results;
    },
    updateMany: async ({ where, data }) => {
      if (!db) return { count: 0 };
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.extractedRecordId) {
        query.extractedRecordId = typeof where.extractedRecordId === 'object' && where.extractedRecordId.in
          ? { $in: where.extractedRecordId.in }
          : where.extractedRecordId;
      }
      if (where?.extractedRecord?.documentId) {
        const records = await db.collection('extractedRecords').find({ documentId: where.extractedRecord.documentId }).toArray();
        query.extractedRecordId = { $in: records.map(r => r.id) };
      }
      const res = await db.collection('labResults').updateMany(query, { $set: data });
      return { count: res.modifiedCount };
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('labResults').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  labTest: {
    findUnique: async ({ where }) => {
      if (!db) return null;
      const query = {};
      if (where.id) query.id = where.id;
      if (where.canonicalName) query.canonicalName = where.canonicalName;
      return db.collection('labTests').findOne(query, { projection: { _id: 0 } });
    },
    findFirst: async ({ where }) => {
      if (!db) return null;
      return db.collection('labTests').findOne(where || {}, { projection: { _id: 0 } });
    },
    findMany: async () => {
      if (!db) return [];
      return db.collection('labTests').find({}, { projection: { _id: 0 } }).toArray();
    },
    create: async ({ data }) => {
      const lt = { id: data.id || uuidv4(), ...data };
      await db.collection('labTests').insertOne({ ...lt });
      return lt;
    },
    upsert: async ({ where, update = {}, create = {} }) => {
      if (!db) return null;
      const query = {};
      if (where?.id) query.id = where.id;
      if (where?.canonicalName) query.canonicalName = where.canonicalName;
      const existing = await db.collection('labTests').findOne(query, { projection: { _id: 0 } });
      if (existing) {
        if (update && Object.keys(update).length > 0) {
          await db.collection('labTests').updateOne(query, { $set: update });
          return { ...existing, ...update };
        }
        return existing;
      }
      const newLt = { id: create.id || uuidv4(), ...create };
      await db.collection('labTests').insertOne({ ...newLt });
      return newLt;
    }
  },

  documentPage: {
    create: async ({ data }) => {
      const page = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString() };
      await db.collection('documentPages').insertOne({ ...page });
      return page;
    },
    deleteMany: async ({ where } = {}) => {
      if (!db) return { count: 0 };
      const res = await db.collection('documentPages').deleteMany(where || {});
      return { count: res.deletedCount };
    },
    findMany: async ({ where }) => {
      if (!db) return [];
      return db.collection('documentPages').find(where || {}, { projection: { _id: 0 } }).toArray();
    }
  },

  processingJob: {
    create: async ({ data }) => {
      const job = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await db.collection('processingJobs').insertOne({ ...job });
      return job;
    },
    update: async ({ where, data }) => {
      if (!db) return null;
      const updateDoc = { ...data, updatedAt: new Date().toISOString() };
      const mongoUpdate = { $set: updateDoc };
      if (data.attempts && typeof data.attempts === 'object' && data.attempts.increment) {
        delete updateDoc.attempts;
        mongoUpdate.$inc = { attempts: data.attempts.increment };
      }
      await db.collection('processingJobs').updateOne({ id: where.id }, mongoUpdate);
      return db.collection('processingJobs').findOne({ id: where.id }, { projection: { _id: 0 } });
    },
    findFirst: async ({ where }) => {
      if (!db) return null;
      return db.collection('processingJobs').findOne(where || {}, { projection: { _id: 0 } });
    }
  },

  medicalEvent: {
    create: async ({ data }) => {
      const evt = {
        id: data.id || uuidv4(),
        ...data,
        createdAt: new Date().toISOString()
      };
      await db.collection('medicalEvents').insertOne({ ...evt });
      return evt;
    },
    count: async ({ where } = {}) => {
      if (!db) return 0;
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.eventDate?.gte) query.eventDate = { $gte: new Date(where.eventDate.gte).toISOString() };
      if (where?.eventDate?.lte) query.eventDate = { ...query.eventDate, $lte: new Date(where.eventDate.lte).toISOString() };
      return db.collection('medicalEvents').countDocuments(query);
    },
    findMany: async ({ where, orderBy, skip = 0, take = 50, include } = {}) => {
      if (!db) return [];
      const query = {};
      if (where?.userId) query.userId = where.userId;
      if (where?.eventType) query.eventType = where.eventType;
      if (where?.eventDate?.gte) query.eventDate = { $gte: new Date(where.eventDate.gte).toISOString() };
      if (where?.eventDate?.lte) query.eventDate = { ...query.eventDate, $lte: new Date(where.eventDate.lte).toISOString() };

      const sortOpt = orderBy?.eventDate === 'desc' ? { eventDate: -1 } : { eventDate: 1 };
      const events = await db.collection('medicalEvents')
        .find(query, { projection: { _id: 0 } })
        .sort(sortOpt)
        .skip(skip)
        .limit(take)
        .toArray();

      if (include?.document) {
        return Promise.all(events.map(async (ev) => {
          const doc = ev.documentId
            ? await db.collection('documents').findOne({ id: ev.documentId }, { projection: { _id: 0 } })
            : null;
          return { ...ev, document: doc };
        }));
      }

      return events;
    }
  },

  documentChunk: {
    create: async ({ data }) => {
      const chunk = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString() };
      await db.collection('documentChunks').insertOne({ ...chunk });
      return chunk;
    },
    findMany: async ({ where, include, take = 50 }) => {
      if (!db) return [];
      const query = {};
      if (where?.userId) query.userId = where.userId;
      let chunks = await db.collection('documentChunks')
        .find(query, { projection: { _id: 0 } })
        .limit(take)
        .toArray();

      if (include?.document) {
        chunks = await Promise.all(chunks.map(async (c) => {
          const doc = await db.collection('documents').findOne({ id: c.documentId }, { projection: { _id: 0 } });
          return { ...c, document: doc };
        }));
      }
      return chunks;
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('documentChunks').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  chatSession: {
    create: async ({ data }) => {
      const s = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await db.collection('chatSessions').insertOne({ ...s });
      return s;
    },
    findFirst: async ({ where, include }) => {
      if (!db) return null;
      const s = await db.collection('chatSessions').findOne({ id: where.id, userId: where.userId }, { projection: { _id: 0 } });
      if (!s) return null;
      if (include?.messages) {
        s.messages = await db.collection('chatMessages')
          .find({ sessionId: s.id }, { projection: { _id: 0 } })
          .sort({ createdAt: 1 })
          .toArray();
      }
      return s;
    },
    findMany: async ({ where, orderBy }) => {
      if (!db) return [];
      const query = {};
      if (where?.userId) query.userId = where.userId;
      return db.collection('chatSessions')
        .find(query, { projection: { _id: 0 } })
        .sort({ updatedAt: -1 })
        .toArray();
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('chatSessions').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  chatMessage: {
    create: async ({ data }) => {
      const msg = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString() };
      await db.collection('chatMessages').insertOne({ ...msg });
      return msg;
    },
    findMany: async ({ where, orderBy }) => {
      if (!db) return [];
      return db.collection('chatMessages')
        .find(where || {}, { projection: { _id: 0 } })
        .sort({ createdAt: 1 })
        .toArray();
    }
  },

  generatedSummary: {
    findMany: async ({ where }) => {
      if (!db) return [];
      const query = {};
      if (where?.userId) query.userId = where.userId;
      return db.collection('generatedSummaries')
        .find(query, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
    },
    findFirst: async ({ where }) => {
      if (!db) return null;
      const query = { id: where.id };
      if (where.userId) query.userId = where.userId;
      return db.collection('generatedSummaries').findOne(query, { projection: { _id: 0 } });
    },
    create: async ({ data }) => {
      const sum = { id: data.id || uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await db.collection('generatedSummaries').insertOne({ ...sum });
      return sum;
    },
    update: async ({ where, data }) => {
      if (!db) return null;
      await db.collection('generatedSummaries').updateOne({ id: where.id }, { $set: { ...data, updatedAt: new Date().toISOString() } });
      return db.collection('generatedSummaries').findOne({ id: where.id }, { projection: { _id: 0 } });
    },
    deleteMany: async ({ where }) => {
      if (!db) return { count: 0 };
      const res = await db.collection('generatedSummaries').deleteMany(where || {});
      return { count: res.deletedCount };
    }
  },

  auditLog: {
    create: async ({ data }) => {
      const entry = { id: uuidv4(), ...data, timestamp: new Date().toISOString() };
      if (db) await db.collection('auditLogs').insertOne({ ...entry });
      return entry;
    },
    findMany: async () => {
      if (!db) return [];
      return db.collection('auditLogs').find({}, { projection: { _id: 0 } }).toArray();
    }
  },

  consentRecord: {
    create: async ({ data }) => {
      const c = { id: uuidv4(), ...data, grantedAt: new Date().toISOString() };
      if (db) await db.collection('consentRecords').insertOne({ ...c });
      return c;
    }
  },

  $transaction: async (fn) => {
    if (typeof fn === 'function') {
      return fn(mongoDb);
    }
    return Promise.all(fn);
  }
};
