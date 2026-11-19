import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import {
  getDocumentExtractions,
  updateExtractedRecord,
  verifyExtractedRecord,
  verifyAllDocumentExtractions
} from '../services/extractionReviewService.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();
router.use(authenticate);

const updateExtractionSchema = z.object({
  rawValue: z.string().optional(),
  normalizedValue: z.number().optional(),
  rawUnit: z.string().optional(),
  normalizedUnit: z.string().optional(),
  referenceRangeRaw: z.string().optional(),
  reviewerNotes: z.string().max(500).optional()
});

// GET /api/v1/documents/:id/extractions
router.get('/documents/:id/extractions', async (req, res, next) => {
  try {
    const extractions = await getDocumentExtractions(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: {
        documentId: req.params.id,
        count: extractions.length,
        extractions
      }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/extractions/:id
router.patch('/extractions/:id', async (req, res, next) => {
  try {
    const parsed = updateExtractionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid update parameters', parsed.error.issues);
    }

    const result = await updateExtractedRecord(
      req.user.userId,
      req.params.id,
      parsed.data,
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({
      success: true,
      message: 'Extracted record updated and marked as EDITED',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/extractions/:id/verify
router.post('/extractions/:id/verify', async (req, res, next) => {
  try {
    const result = await verifyExtractedRecord(
      req.user.userId,
      req.params.id,
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:id/verify-all
router.post('/documents/:id/verify-all', async (req, res, next) => {
  try {
    const result = await verifyAllDocumentExtractions(
      req.user.userId,
      req.params.id,
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;

