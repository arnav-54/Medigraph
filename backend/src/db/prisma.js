import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { connectMongo, disconnectMongo, mongoDb, isMongoConnected } from './mongoStore.js';

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
    if (mongoDb[model]) {
      return mongoDb[model];
    }
    return {};
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
