import { RateLimitError } from '../utils/errors.js';
import { env } from '../config/env.js';

/**
 * Sliding-window in-memory rate limiter middleware.
 * Prevents brute-force credential attacks and endpoint flooding.
 */
export function createRateLimiter(options = {}) {
  const isDev = env.NODE_ENV === 'development';
  const windowMs = options.windowMs || 15 * 60 * 1000;
  // Generous limit in development to avoid blocking local testing
  const maxRequests = isDev ? 1000 : (options.maxRequests || 100);
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || 'anonymous';
    const now = Date.now();

    const record = requests.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    requests.set(key, record);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      return next(new RateLimitError(`Rate limit exceeded. Please wait before retrying.`));
    }

    next();
  };
}

// Specialized rate limiters
export const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 20 });
export const uploadRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 30 });
export const chatRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 50 });

