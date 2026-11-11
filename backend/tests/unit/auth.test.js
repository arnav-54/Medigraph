import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken
} from '../../src/services/authService.js';
import { requireRole, requireTenantOwnership } from '../../src/middleware/auth.js';
import { UnauthorizedError, ForbiddenError } from '../../src/utils/errors.js';

describe('Auth Service & Tenant Security (Phase 3)', () => {
  const sampleUser = {
    id: 'usr-123e4567-e89b-12d3-a456-426614174000',
    email: 'patient.demo@medigraph.ai',
    role: 'PATIENT'
  };

  describe('Argon2 Password Hashing', () => {
    it('hashes passwords securely using Argon2id with salt and memory cost', async () => {
      const password = 'StrongPassword123!@#';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, 'WrongPassword456');
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation & Verification', () => {
    it('generates valid access and refresh token pair with correct claims', () => {
      const tokens = generateTokens(sampleUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decodedAccess = verifyAccessToken(tokens.accessToken);
      expect(decodedAccess.userId).toBe(sampleUser.id);
      expect(decodedAccess.email).toBe(sampleUser.email);
      expect(decodedAccess.role).toBe(sampleUser.role);

      const decodedRefresh = verifyRefreshToken(tokens.refreshToken);
      expect(decodedRefresh.userId).toBe(sampleUser.id);
    });

    it('rejects tampered or malformed tokens', () => {
      const tokens = generateTokens(sampleUser);
      const tampered = tokens.accessToken.slice(0, -6) + 'abcdef';

      expect(() => verifyAccessToken(tampered)).toThrow(UnauthorizedError);
      expect(() => verifyAccessToken('totally-invalid-token')).toThrow(UnauthorizedError);
    });
  });

  describe('Role-Based Authorization Middleware', () => {
    it('allows access when user has the required role', () => {
      const req = { user: { role: 'CLINICIAN' } };
      const res = {};
      let called = false;
      const next = (err) => {
        expect(err).toBeUndefined();
        called = true;
      };

      const middleware = requireRole(['CLINICIAN', 'ADMIN']);
      middleware(req, res, next);
      expect(called).toBe(true);
    });

    it('rejects access when user lacks the required role with 403 Forbidden', () => {
      const req = { user: { role: 'PATIENT' } };
      const res = {};
      let errorEncountered = null;
      const next = (err) => {
        errorEncountered = err;
      };

      const middleware = requireRole(['CLINICIAN', 'ADMIN']);
      middleware(req, res, next);
      expect(errorEncountered).toBeInstanceOf(ForbiddenError);
      expect(errorEncountered.statusCode).toBe(403);
    });
  });

  describe('Tenant Ownership Middleware (IDOR Prevention)', () => {
    it('allows request when target resource belongs to the authenticated user', () => {
      const req = {
        user: { userId: 'usr-111', role: 'PATIENT' },
        params: { userId: 'usr-111' }
      };
      let called = false;
      const next = (err) => {
        expect(err).toBeUndefined();
        called = true;
      };

      requireTenantOwnership(req, {}, next);
      expect(called).toBe(true);
    });

    it('blocks request when a user attempts to access another user\'s records', () => {
      const req = {
        user: { userId: 'usr-111', role: 'PATIENT' },
        params: { userId: 'usr-222-victim' }
      };
      let errorEncountered = null;
      const next = (err) => {
        errorEncountered = err;
      };

      requireTenantOwnership(req, {}, next);
      expect(errorEncountered).toBeInstanceOf(ForbiddenError);
      expect(errorEncountered.statusCode).toBe(403);
      expect(errorEncountered.message).toContain('another user\'s health records');
    });

    it('allows ADMIN role to access tenant resources', () => {
      const req = {
        user: { userId: 'admin-999', role: 'ADMIN' },
        params: { userId: 'usr-222-patient' }
      };
      let called = false;
      const next = (err) => {
        expect(err).toBeUndefined();
        called = true;
      };

      requireTenantOwnership(req, {}, next);
      expect(called).toBe(true);
    });
  });
});
