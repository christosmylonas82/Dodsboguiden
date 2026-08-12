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
  await prisma.invitation.updateMany({
    where: { invitedEmail: body.email, invitedUserId: null },
    data: { invitedUserId: user.id },
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

const updateEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string().min(1),
});

export async function updateEmail(req: Request, res: Response) {
  const body = updateEmailSchema.parse(req.body);
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Incorrect password');
  }

  const existing = await prisma.user.findUnique({ where: { email: body.newEmail } });
  if (existing && existing.id !== userId) {
    throw new HttpError(409, 'This email is already in use');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { email: body.newEmail },
  });

  res.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    hasSeenTipsOnboarding: updated.hasSeenTipsOnboarding,
  });
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export async function updatePassword(req: Request, res: Response) {
  const body = updatePasswordSchema.parse(req.body);
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  const valid = await verifyPassword(body.currentPassword, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Incorrect current password');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(body.newPassword) },
  });

  res.json({ success: true });
}
