import { prisma } from './prisma.js';
import { getGeolocation } from './geoip.js';

export function logAuthEvent(params: {
  userId?: string;
  email: string;
  action: 'login_success' | 'login_failed';
  ipAddress?: string;
  userAgent?: string;
}) {
  const geo = getGeolocation(params.ipAddress);

  return prisma.authEvent.create({
    data: {
      userId: params.userId,
      email: params.email,
      action: params.action,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      country: geo.country,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
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
