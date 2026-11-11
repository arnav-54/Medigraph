import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId;

  // Distinguish known AppErrors from unexpected runtime errors
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      correlationId,
      path: req.originalUrl,
      details: err.details
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        correlationId
      }
    });
  }

  // Unexpected exceptions (500)
  logger.error(`Unhandled system error: ${err.message}`, {
    stack: env.NODE_ENV === 'production' ? undefined : err.stack,
    correlationId,
    path: req.originalUrl
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      correlationId
    }
  });
}

