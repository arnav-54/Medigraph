import express from 'express';
import { z } from 'zod';
import { registerUser, loginUser, refreshSession } from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';
import { ValidationError } from '../utils/errors.js';
import { logAuditEvent } from '../services/auditService.js';
import { prisma } from '../db/prisma.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(1).max(100).optional(),
  role: z.enum(['PATIENT', 'CLINICIAN']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};

// Register
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Registration validation failed', parsed.error.issues);
    }

    const { user, tokens } = await registerUser({
      ...parsed.data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      data: {
        user,
        tokens
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Login validation failed', parsed.error.issues);
    }

    const { user, tokens } = await loginUser({
      ...parsed.data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success: true,
      data: {
        user,
        tokens
      }
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    const { user, tokens } = await refreshSession(refreshToken);

    res.cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success: true,
      data: {
        user,
        tokens
      }
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await logAuditEvent({
      userId: req.user.userId,
      action: 'USER_LOGOUT',
      resourceType: 'USER',
      resourceId: req.user.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Current user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            dateOfBirth: true,
            gender: true,
            isSyntheticDemo: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          fullName: user.profile?.fullName || null
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

