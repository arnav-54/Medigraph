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
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' }
          ]
        : [{ emit: 'event', level: 'error' }]
    });

    if (env.NODE_ENV === 'development') {
      prismaInstance.$on('query', (e) => {
        // Redact any params from raw queries to prevent PHI exposure
        logger.debug('Prisma Query', { durationMs: e.duration });
      });
    }

    prismaInstance.$on('error', (e) => {
      logger.error('Prisma Database Error', { target: e.target });
    });
  }

  return prismaInstance;
}

export const prisma = getPrismaClient();

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    logger.info('Database client gracefully disconnected.');
  }
}

