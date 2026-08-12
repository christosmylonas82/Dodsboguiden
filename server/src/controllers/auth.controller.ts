import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../middleware/errorHandler.js';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'GDPR consent is required to register' }),
  }),
});

export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash: await hashPassword(body.password),
      gdprConsent: true,
      consentDate: new Date(),
    },
  });

  // Link any pending project invites sent to this email before they registered.
  await prisma.projectMember.updateMany({
    where: { email: body.email, userId: null },
    data: { userId: user.id },
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
    },
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || user.deletedAt) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
    },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
  });
}

export async function markTipsSeen(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { hasSeenTipsOnboarding: true },
  });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
  });
}
