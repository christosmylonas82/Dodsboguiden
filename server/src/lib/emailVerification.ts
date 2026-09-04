import crypto from 'node:crypto';
import { prisma } from './prisma.js';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerification.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerification.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

export async function useEmailVerificationToken(token: string) {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification || verification.usedAt || verification.expiresAt < new Date() || verification.user.deletedAt) {
    return null;
  }

  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { usedAt: new Date() },
  });

  return verification;
}
