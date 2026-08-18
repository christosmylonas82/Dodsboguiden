import { prisma } from './prisma.js';

// IP/geolocation/user-agent capture is intentionally disabled — see logAuthEvent.
export function logAuthEvent(params: { userId?: string; email: string; action: 'login_success' | 'login_failed' }) {
  return prisma.authEvent.create({
    data: {
      userId: params.userId,
      email: params.email,
      action: params.action,
    },
  });
}

// Called when a user is deleted (self-service or admin). Keeps the audit trail's
// shape (userId, action, timestamp) intact for security stats, but strips every
// field that identifies the person or where they logged in from.
export function scrubAuthEventsForUser(userId: string) {
  return prisma.authEvent.updateMany({
    where: { userId },
    data: {
      email: 'deleted-user',
      ipAddress: null,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      userAgent: null,
    },
  });
}
