import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { sanitizeLogData } from '../../src/utils/logger.js';
import { ValidationError, UnauthorizedError, ForbiddenError, ConflictError } from '../../src/utils/errors.js';

describe('MediGraph AI Foundation Suite (Phase 2)', () => {
  const app = createApp();

  describe('Health Checks & Base Routes', () => {
    it('GET /health/live returns HTTP 200 with service health info', async () => {
      const res = await request(app).get('/health/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('pass');
      expect(res.body.service).toBe('medigraph-backend');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('GET /health/ready returns HTTP 200 with readiness status', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('pass');
      expect(res.body.checks.api).toBe('healthy');
    });

    it('GET /api/v1 returns operational API status and version', async () => {
      const res = await request(app).get('/api/v1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('MediGraph AI API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.status).toBe('operational');
    });

    it('GET /unknown-route returns HTTP 404 with standard error JSON', async () => {
      const res = await request(app).get('/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain('not found');
      expect(res.body.error.correlationId).toBeDefined();
    });
  });

  describe('Correlation ID Middleware', () => {
    it('generates a new correlation ID when none is provided', async () => {
      const res = await request(app).get('/health/live');
      const header = res.headers['x-correlation-id'];
      expect(header).toBeDefined();
      expect(header.length).toBeGreaterThan(10);
    });

    it('preserves client-provided correlation ID', async () => {
      const clientCorrelationId = 'client-trace-123456';
      const res = await request(app)
        .get('/health/live')
        .set('X-Correlation-ID', clientCorrelationId);
      expect(res.headers['x-correlation-id']).toBe(clientCorrelationId);
    });
  });

  describe('PHI & Credential Sanitizer', () => {
    it('redacts sensitive health information and credentials from log objects', () => {
      const sensitiveData = {
        userId: 'usr-123',
        email: 'patient@example.com',
        password: 'SuperSecretPassword123!',
        passwordHash: '$argon2id$v=19$m=65536...',
        token: 'eyJhbGciOiJIUzI1NiIsIn...',
        authorization: 'Bearer eyJhbGciOi...',
        patientName: 'Jane Doe',
        rawText: 'Patient shows signs of elevated blood glucose (165 mg/dL)',
        rawValue: '165',
        normalizedValue: 165,
        dob: '1985-04-12',
        safeMetadata: {
          documentId: 'doc-456',
          content: 'Confidential clinical notes',
          pageCount: 3
        }
      };

      const sanitized = sanitizeLogData(sensitiveData);

      // Safe fields preserved
      expect(sanitized.userId).toBe('usr-123');
      expect(sanitized.email).toBe('patient@example.com');
      expect(sanitized.safeMetadata.documentId).toBe('doc-456');
      expect(sanitized.safeMetadata.pageCount).toBe(3);

      // Sensitive fields strictly redacted
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.passwordHash).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.authorization).toBe('[REDACTED]');
      expect(sanitized.patientName).toBe('[REDACTED]');
      expect(sanitized.rawText).toBe('[REDACTED]');
      expect(sanitized.rawValue).toBe('[REDACTED]');
      expect(sanitized.normalizedValue).toBe('[REDACTED]');
      expect(sanitized.dob).toBe('[REDACTED]');
      expect(sanitized.safeMetadata.content).toBe('[REDACTED]');
    });
  });

  describe('Standardized Error Classes', () => {
    it('creates ValidationError with status 400 and code VALIDATION_ERROR', () => {
      const err = new ValidationError('Invalid email format', [{ field: 'email', message: 'Required' }]);
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.details).toHaveLength(1);
    });

    it('creates UnauthorizedError with status 401 and code UNAUTHORIZED', () => {
      const err = new UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('creates ForbiddenError with status 403 and code FORBIDDEN', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('creates ConflictError with status 409 and code CONFLICT', () => {
      const err = new ConflictError('Duplicate document checksum detected');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CONFLICT');
    });
  });
});

