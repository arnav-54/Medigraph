import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAvailableLabTests,
  getLabTestTrend,
  getLabTrendsOverview
} from '../services/analyticsService.js';

const router = express.Router();
router.use(authenticate);

// GET /api/v1/analytics/lab-tests
router.get('/lab-tests', async (req, res, next) => {
  try {
    const tests = await getAvailableLabTests(req.user.userId);
    res.status(200).json({
      success: true,
      data: { tests }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/lab-trends
router.get('/lab-trends', async (req, res, next) => {
  try {
    const trends = await getLabTrendsOverview(req.user.userId);
    res.status(200).json({
      success: true,
      data: { trends }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/lab-trends/:testId
router.get('/lab-trends/:testId', async (req, res, next) => {
  try {
    const onlyVerified = req.query.onlyVerified === 'true';
    const unit = req.query.unit || null;

    const trend = await getLabTestTrend(req.user.userId, {
      testIdentifier: req.params.testId,
      unit,
      onlyVerified
    });

    res.status(200).json({
      success: true,
      data: { trend }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

