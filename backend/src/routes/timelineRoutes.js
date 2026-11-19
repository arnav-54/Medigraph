import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMedicalTimeline, getTimelineEventById } from '../services/timelineService.js';

const router = express.Router();
router.use(authenticate);

// GET /api/v1/timeline
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { startDate, endDate, eventType, search, verificationStatus } = req.query;

    const result = await getMedicalTimeline(req.user.userId, {
      startDate,
      endDate,
      eventType,
      search,
      verificationStatus,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/timeline/:id
router.get('/:id', async (req, res, next) => {
  try {
    const event = await getTimelineEventById(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

