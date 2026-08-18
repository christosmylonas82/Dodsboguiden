import { prisma } from './prisma.js';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function purgeExpiredAuthEvents(): Promise<void> {
  const result = await prisma.authEvent.deleteMany({
    where: { timestamp: { lt: new Date(Date.now() - NINETY_DAYS_MS) } },
  });

  if (result.count > 0) {
    console.log(`authEventPurge: deleted ${result.count} auth event(s) past the 90-day retention window`);
  }
}
