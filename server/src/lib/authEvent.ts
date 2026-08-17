import { prisma } from './prisma.js';

export function logAuthEvent(params: { userId?: string; email: string; action: 'login_success' | 'login_failed' }) {
  return prisma.authEvent.create({
    data: { userId: params.userId, email: params.email, action: params.action },
  });
}
