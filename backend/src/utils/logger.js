import pino from 'pino';
import { env } from '../config/env.js';

// Sensitive keys that must NEVER appear in logs (PHI & Credentials)
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'rawtext',
  'extractedtext',
  'ocrtext',
  'rawvalue',
  'normalizedvalue',
  'patientname',
  'dateofbirth',
  'dob',
  'ssn',
  'content',
  'summarytext'
]);

/**
 * Recursively redacts sensitive keys from log objects.
 */
export function sanitizeLogData(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 5) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeLogData(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const transport = env.NODE_ENV === 'development'
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  : undefined;

const baseLogger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  formatters: {
    log(obj) {
      return sanitizeLogData(obj);
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
}, transport ? pino.transport(transport) : undefined);

export const logger = {
  info: (msg, meta = {}) => baseLogger.info(sanitizeLogData(meta), msg),
  warn: (msg, meta = {}) => baseLogger.warn(sanitizeLogData(meta), msg),
  error: (msg, meta = {}) => baseLogger.error(sanitizeLogData(meta), msg),
  debug: (msg, meta = {}) => baseLogger.debug(sanitizeLogData(meta), msg)
};
