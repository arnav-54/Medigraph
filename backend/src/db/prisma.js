import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { connectMongo, disconnectMongo, mongoDb, isMongoConnected, getDb } from './mongoStore.js';

function getCollectionForModel(modelName) {
  const db = getDb();
  if (!db) return null;
  // Map Prisma model names to MongoDB collection names
  const mapping = {
    user: 'users',
    userProfile: 'userProfiles',
    document: 'documents',
    documentPage: 'documentPages',
    processingJob: 'processingJobs',
    extractedRecord: 'extractedRecords',
    labResult: 'labResults',
    labTest: 'labTests',
    medicalEvent: 'medicalEvents',
    documentChunk: 'documentChunks',
    chatSession: 'chatSessions',
    chatMessage: 'chatMessages',
    generatedSummary: 'generatedSummaries',
    auditLog: 'auditLogs',
    consentRecord: 'consentRecords'
  };
  const collName = mapping[modelName] || (modelName.endsWith('s') ? modelName : `${modelName}s`);
  return db.collection(collName);
}

// Exclusive MongoDB Driver Proxy: routes exclusively to MongoDB Atlas
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === '$transaction') {
      return async (arg) => mongoDb.$transaction(arg);
    }

    if (prop === '$disconnect') {
      return async () => disconnectMongo();
    }

    const model = prop.toString();
    const modelTarget = mongoDb[model] || {};

    return new Proxy(modelTarget, {
      get(mTarget, methodName) {
        if (mTarget[methodName]) {
          return mTarget[methodName];
        }
        if (methodName === 'count') {
          return async ({ where } = {}) => {
            const coll = getCollectionForModel(model);
            if (!coll) return 0;
            const query = {};
            if (where?.userId) query.userId = where.userId;
            if (where?.deletedAt === null) query.deletedAt = null;
            if (where?.processingStatus) query.processingStatus = where.processingStatus;
            return coll.countDocuments(query);
          };
        }
        if (methodName === 'deleteMany') {
          return async ({ where } = {}) => {
            const coll = getCollectionForModel(model);
            if (!coll) return { count: 0 };
            const res = await coll.deleteMany(where || {});
            return { count: res.deletedCount };
          };
        }
        if (methodName === 'upsert') {
          return async ({ where, update = {}, create = {} }) => {
            const coll = getCollectionForModel(model);
            if (!coll) return null;
            const existing = await coll.findOne(where, { projection: { _id: 0 } });
            if (existing) {
              if (update && Object.keys(update).length > 0) {
                await coll.updateOne(where, { $set: update });
                return { ...existing, ...update };
              }
              return existing;
            }
            const item = { id: create.id || uuidv4(), ...create };
            await coll.insertOne({ ...item });
            return item;
          };
        }
        return async () => null;
      }
    });
  }
});

export async function checkDatabaseConnection() {
  try {
    const mongoUri = env.MONGODB_URI || env.DATABASE_URL;
    await connectMongo(mongoUri);
    logger.info(`Connected to MongoDB Atlas: ${mongoUri}`);
    return true;
  } catch (err) {
    logger.error(`Critical: Failed to connect to MongoDB Atlas: ${err.message}`);
    throw err;
  }
}

// Initialize connection on startup
checkDatabaseConnection().catch((err) => {
  logger.error(`MongoDB Atlas startup connection error: ${err.message}`);
});

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
