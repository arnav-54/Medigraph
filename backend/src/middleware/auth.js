import { verifyAccessToken } from '../services/authService.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Extracts and verifies JWT access token from Authorization header or cookie.
 * Attaches decoded payload to req.user: { userId, email, role }.
 */
export function authenticate(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication token required'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforces Role-Based Access Control.
 * @param {string|string[]} roles - Allowed role or array of allowed roles
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires one of roles: ${allowed.join(', ')}`));
    }

    next();
  };
}

/**
 * Enforces tenant ownership. Ensures target user ID matches authenticated user.
 */
export function requireTenantOwnership(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const requestedUserId = req.params.userId || req.body.userId || req.query.userId;
  if (requestedUserId && requestedUserId !== req.user.userId && req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('You do not have permission to access another user\'s health records'));
  }

  next();
}

