import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../middleware/errorHandler.js';

function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
    profileImageUrl: user.profileImageUrl,
  };
}

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
  res.status(201).json({ token, user: toUserResponse(user) });
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
  res.json({ token, user: toUserResponse(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }
  res.json(toUserResponse(user));
}

export async function markTipsSeen(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { hasSeenTipsOnboarding: true },
  });
  res.json(toUserResponse(user));
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

  res.json(toUserResponse(updated));
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

const IMAGE_DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+=*)$/;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const updateProfileImageSchema = z.object({
  imageDataUrl: z.string().min(1),
});

export async function updateProfileImage(req: Request, res: Response) {
  const body = updateProfileImageSchema.parse(req.body);

  const match = body.imageDataUrl.match(IMAGE_DATA_URL_PATTERN);
  if (!match) {
    throw new HttpError(400, 'Image must be a JPEG, PNG, or WebP data URL');
  }

  const byteLength = Math.ceil((match[2].length * 3) / 4);
  if (byteLength > MAX_IMAGE_BYTES) {
    throw new HttpError(400, 'Image is too large');
  }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { profileImageUrl: body.imageDataUrl },
  });

  res.json(toUserResponse(user));
}

export async function removeProfileImage(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { profileImageUrl: null },
  });

  res.json(toUserResponse(user));
}
