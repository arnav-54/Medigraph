import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

export const DOCUMENT_QUEUE_NAME = 'document-processing';

let redisConnection = null;
let bullQueue = null;
const localFallbackEmitter = new EventEmitter();

/**
 * Initializes or returns the BullMQ queue, with resilient local fallback.
 */
export function getDocumentQueue() {
  if (bullQueue) return bullQueue;

  try {
    redisConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null // don't spam reconnect if Redis offline
    });

    redisConnection.on('error', (err) => {
      logger.warn('Redis connection unavailable. Document queue running in direct fallback mode.', {
        error: err.message
      });
    });

    bullQueue = new Queue(DOCUMENT_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 200
      }
    });

    return bullQueue;
  } catch (err) {
    logger.warn('Could not initialize BullMQ, using local fallback queue', { error: err.message });
    return null;
  }
}

/**
 * Dispatches a document processing job.
 */
export async function enqueueDocumentJob(documentId, metadata = {}) {
  const queue = getDocumentQueue();

  try {
    if (queue && redisConnection && redisConnection.status === 'ready') {
      const job = await queue.add(
        'process-document',
        { documentId, metadata },
        { jobId: `doc-${documentId}` }
      );
      logger.info('Document enqueued in BullMQ', { documentId, jobId: job.id });
      return { queueJobId: job.id, mode: 'bullmq' };
    }
  } catch (err) {
    logger.warn('BullMQ enqueue failed, executing via local async dispatch', {
      documentId,
      error: err.message
    });
  }

  // Local async fallback dispatch
  setImmediate(() => {
    localFallbackEmitter.emit('process-job', { documentId, metadata });
  });

  return { queueJobId: `local-${documentId}-${Date.now()}`, mode: 'local' };
}

export { localFallbackEmitter };
