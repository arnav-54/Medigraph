import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { disconnectPrisma } from './db/prisma.js';
// Register asynchronous document ingestion worker
import './workers/documentWorker.js';

const server = app.listen(env.PORT, () => {
  logger.info(`MediGraph AI Core API listening on port ${env.PORT}`, {
    port: env.PORT,
    nodeEnv: env.NODE_ENV
  });
});

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Commencing graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await disconnectPrisma();
      logger.info('All resources released. Process exiting cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown cleanup', { error: err.message });
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if hanging
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('CRITICAL: Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
});

process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

