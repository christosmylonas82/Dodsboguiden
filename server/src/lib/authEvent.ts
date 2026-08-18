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
