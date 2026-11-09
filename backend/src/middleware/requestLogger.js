import { logger } from '../utils/logger.js';

/**
 * Logs HTTP incoming request and completion metrics.
 * Strictly prevents logging query parameters or bodies that may contain health data.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const correlationId = req.correlationId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      correlationId,
      method: req.method,
      url: req.baseUrl + req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.baseUrl + req.path} -> ${res.statusCode}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.baseUrl + req.path} -> ${res.statusCode}`, meta);
    } else {
      logger.info(`HTTP ${req.method} ${req.baseUrl + req.path} -> ${res.statusCode}`, meta);
    }
  });

  next();
}
