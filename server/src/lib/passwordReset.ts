import crypto from 'node:crypto';
import { prisma } from './prisma.js';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createPasswordResetToken(userId: string): Promise<string> {
  await prisma.passwordReset.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date() || reset.user.deletedAt) {
    return null;
  }

  return reset;
}

export async function usePasswordResetToken(token: string) {
  const reset = await verifyPasswordResetToken(token);
  if (!reset) return null;

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  return reset;
}
