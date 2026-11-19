import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { connectMongo, disconnectMongo, mongoDb, isMongoConnected } from './mongoStore.js';
import { localDb } from './localStore.js';

let isMongoActive = false;

// Transparent Proxy that routes to MongoDB when connected, or localDb as fallback
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === '$transaction') {
      return async (arg) => {
        if (isMongoActive) {
          return mongoDb.$transaction(arg);
        }
        return localDb.$transaction(arg);
      };
    }

    if (prop === '$disconnect') {
      return async () => {
        if (isMongoActive) {
          await disconnectMongo();
        }
      };
    }

    const model = prop.toString();
    if (isMongoActive && mongoDb[model]) {
      return mongoDb[model];
    }
    return localDb[model] || {};
  }
});

export async function checkDatabaseConnection() {
  try {
    const mongoUri = env.MONGODB_URI || env.DATABASE_URL || 'mongodb://127.0.0.1:27017/medigraph_db';
    await connectMongo(mongoUri);
    isMongoActive = true;
    logger.info(`Connected to MongoDB database (${mongoUri})`);
    return true;
  } catch (err) {
    isMongoActive = false;
    logger.info('MongoDB offline. Seamlessly running in Standalone Local Store mode (storage/local-db.json)');
    return false;
  }
}

// Trigger background connectivity check on startup
checkDatabaseConnection().catch(() => {});

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
