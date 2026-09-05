import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, validatePassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../middleware/errorHandler.js';
import { usePasswordResetToken } from '../lib/passwordReset.js';
import { createEmailVerificationToken, useEmailVerificationToken } from '../lib/emailVerification.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../lib/email.js';
import { logAuthEvent } from '../lib/authEvent.js';
import { CURRENT_ONBOARDING_VERSION } from '../lib/onboarding.js';
import { getPrimaryClientOrigin } from '../lib/clientOrigin.js';

function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasSeenTipsOnboarding: user.hasSeenTipsOnboarding,
    onboardingVersionSeen: user.onboardingVersionSeen,
    currentOnboardingVersion: CURRENT_ONBOARDING_VERSION,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
  };
}

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string(),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'GDPR consent is required to register' }),
  }),
});

export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);

  const passwordError = validatePassword(body.password);
  if (passwordError) {
    throw new HttpError(400, passwordError);
  }

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

  const verificationToken = await createEmailVerificationToken(user.id);
  const verifyLink = `${process.env.API_BASE_URL ?? 'http://localhost:4000'}/auth/verify?token=${verificationToken}`;
  sendVerificationEmail(user.email, user.name, verifyLink).catch((err) =>
    console.error('Failed to send verification email:', err),
  );

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({ token, user: toUserResponse(user) });
}

export async function verifyEmail(req: Request, res: Response) {
  const clientOrigin = getPrimaryClientOrigin();
  const token = typeof req.query.token === 'string' ? req.query.token : null;
  if (!token) {
    return res.redirect(`${clientOrigin}/login?emailVerified=0`);
  }

  const verification = await useEmailVerificationToken(token);
  if (!verification) {
    return res.redirect(`${clientOrigin}/login?emailVerified=0`);
  }

  const user = await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerifiedAt: new Date() },
  });

  sendWelcomeEmail(user.email, user.name).catch((err) => console.error('Failed to send welcome email:', err));

  res.redirect(`${clientOrigin}/dashboard?emailVerified=1`);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || user.deletedAt) {
    await logAuthEvent({ email: body.email, action: 'login_failed' });
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    await logAuthEvent({ userId: user.id, email: user.email, action: 'login_failed' });
    throw new HttpError(401, 'Invalid email or password');
  }

  await logAuthEvent({ userId: user.id, email: user.email, action: 'login_success' });

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

const updateNameSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function updateName(req: Request, res: Response) {
  const body = updateNameSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name: body.name },
  });
  res.json(toUserResponse(user));
}

export async function markTipsSeen(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { hasSeenTipsOnboarding: true },
  });
  res.json(toUserResponse(user));
}

export async function markOnboardingSeen(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { onboardingVersionSeen: CURRENT_ONBOARDING_VERSION },
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
  newPassword: z.string(),
});

export async function updatePassword(req: Request, res: Response) {
  const body = updatePasswordSchema.parse(req.body);
  const userId = req.user!.userId;

  const passwordError = validatePassword(body.newPassword);
  if (passwordError) {
    throw new HttpError(400, passwordError);
  }

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

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string(),
});

export async function resetPassword(req: Request, res: Response) {
  const body = resetPasswordSchema.parse(req.body);

  const passwordError = validatePassword(body.newPassword);
  if (passwordError) {
    throw new HttpError(400, passwordError);
  }

  const reset = await usePasswordResetToken(body.token);
  if (!reset) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  await prisma.user.update({
    where: { id: reset.userId },
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
