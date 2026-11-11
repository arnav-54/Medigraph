import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import extractionRoutes from './routes/extractionRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
  }));

  // CORS
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
  }));

  // Request Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Observability & Tracing Middleware
  app.use(correlationIdMiddleware);
  app.use(requestLogger);

  // Health Checks
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'pass',
      service: 'medigraph-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/health/ready', async (req, res) => {
    res.status(200).json({
      status: 'pass',
      service: 'medigraph-backend',
      checks: {
        api: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
  });

  // Base API Info
  app.get('/api/v1', (req, res) => {
    res.status(200).json({
      name: 'MediGraph AI API',
      version: '1.0.0',
      status: 'operational',
      documentation: '/docs'
    });
  });

  // API Route Handlers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/timeline', timelineRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1', extractionRoutes);

  // 404 Handler for undefined routes
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

