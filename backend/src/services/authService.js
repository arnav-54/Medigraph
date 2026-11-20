import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { logAuditEvent } from './auditService.js';

export async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}

export async function verifyPassword(hashedPassword, plainPassword) {
  return argon2.verify(hashedPassword, plainPassword);
}

export function generateTokens(payload) {
  const tokenPayload = {
    userId: payload.id,
    email: payload.email,
    role: payload.role
  };

  const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY
  });

  const refreshToken = jwt.sign({ userId: payload.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

/**
 * Registers a new user, creates their profile, records consent, and logs audit.
 */
export async function registerUser({
  email,
  password,
  fullName = null,
  role = 'PATIENT',
  ipAddress = null,
  userAgent = null
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    throw new ConflictError('An account with this email address already exists');
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: role || 'PATIENT',
        profile: {
          create: {
            fullName: fullName || null,
            isSyntheticDemo: false
          }
        },
        consents: {
          create: [
            {
              consentType: 'DATA_PROCESSING',
              granted: true,
              version: '1.0',
              ipAddress,
              userAgent
            },
            {
              consentType: 'AI_ANALYSIS',
              granted: true,
              version: '1.0',
              ipAddress,
              userAgent
            }
          ]
        }
      },
      include: {
        profile: true
      }
    });

    return user;
  });

  await logAuditEvent({
    userId: result.id,
    action: 'USER_REGISTER',
    resourceType: 'USER',
    resourceId: result.id,
    ipAddress,
    userAgent
  });

  const tokens = generateTokens(result);

  return {
    user: {
      id: result.id,
      email: result.email,
      role: result.role,
      fullName: result.profile?.fullName || null,
      createdAt: result.createdAt
    },
    tokens
  };
}

/**
 * Authenticates user credentials and issues token pair.
 */
export async function loginUser({ email, password, ipAddress = null, userAgent = null }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { profile: true }
  });

  if (!user || !user.isActive) {
    // Constant time dummy to prevent timing attack enumeration
    try {
      await verifyPassword('$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dummyhash', password || 'dummy');
    } catch {
      // Ignore timing dummy verification error
    }
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await verifyPassword(user.passwordHash, password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  await logAuditEvent({
    userId: user.id,
    action: 'USER_LOGIN',
    resourceType: 'USER',
    resourceId: user.id,
    ipAddress,
    userAgent
  });

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.profile?.fullName || null,
      createdAt: user.createdAt
    },
    tokens
  };
}

/**
 * Rotates tokens using a valid refresh token.
 */
export async function refreshSession(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { profile: true }
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('User account is invalid or deactivated');
  }

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.profile?.fullName || null
    },
    tokens
  };
}

