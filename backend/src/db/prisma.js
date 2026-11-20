import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let prismaInstance = null;

export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' }
          ]
        : [{ emit: 'event', level: 'error' }]
    });

    if (env.NODE_ENV === 'development') {
      prismaInstance.$on('query', (e) => {
        logger.debug('Prisma MongoDB Query', { durationMs: e.duration });
      });
    }

    prismaInstance.$on('error', (e) => {
      logger.error('Prisma Database Error', { target: e.target });
    });
  }

  return prismaInstance;
}

export const prisma = getPrismaClient();

export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('Connected to MongoDB Atlas via official Prisma Client.');
    return true;
  } catch (err) {
    logger.warn('Prisma MongoDB Atlas connection notice:', { message: err.message });
    return false;
  }
}

// Non-blocking connection check on startup
checkDatabaseConnection().catch((err) => {
  logger.warn('Prisma startup notice:', { message: err.message });
});

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    logger.info('Prisma client gracefully disconnected.');
  }
}
