import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import {
  generateMedicalSummary,
  listUserSummaries,
  getSummaryById,
  updateUserSummary
} from '../services/summaryService.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();
router.use(authenticate);

const generateSchema = z.object({
  documentIds: z.array(z.string().uuid()).optional(),
  timeRangeStart: z.string().optional(),
  timeRangeEnd: z.string().optional()
});

const updateSchema = z.object({
  title: z.string().optional(),
  summaryText: z.string().min(1, 'Summary text cannot be empty')
});

// POST /api/v1/summaries
router.post('/', async (req, res, next) => {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid summary options', parsed.error.issues);
    }

    const summary = await generateMedicalSummary(req.user.userId, parsed.data);
    res.status(201).json({
      success: true,
      data: { summary }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/summaries
router.get('/', async (req, res, next) => {
  try {
    const summaries = await listUserSummaries(req.user.userId);
    res.status(200).json({
      success: true,
      data: { summaries }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/summaries/:id
router.get('/:id', async (req, res, next) => {
  try {
    const summary = await getSummaryById(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/summaries/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid update parameters', parsed.error.issues);
    }

    const summary = await updateUserSummary(req.user.userId, req.params.id, parsed.data);
    res.status(200).json({
      success: true,
      message: 'Summary updated successfully',
      data: { summary }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
