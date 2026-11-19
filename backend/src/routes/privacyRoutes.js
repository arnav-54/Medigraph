import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { exportUserData, deleteUserAccount } from '../services/privacyService.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();
router.use(authenticate);

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password confirmation is required for account deletion')
});

// GET /api/v1/privacy/export
router.get('/export', async (req, res, next) => {
  try {
    const exportBundle = await exportUserData(req.user.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="medigraph_data_export_${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.status(200).json(exportBundle);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/privacy/delete-account
router.post('/delete-account', async (req, res, next) => {
  try {
    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Password confirmation required', parsed.error.issues);
    }

    const result = await deleteUserAccount(
      req.user.userId,
      parsed.data.password,
      req.ip,
      req.get('user-agent')
    );

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

