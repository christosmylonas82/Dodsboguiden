import { prisma } from './prisma.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function sweepExpiredArchivedProjects(): Promise<void> {
  const result = await prisma.project.deleteMany({
    where: { deletedAt: { lt: new Date(Date.now() - THIRTY_DAYS_MS) } },
  });

  if (result.count > 0) {
    console.log(`archiveSweep: permanently deleted ${result.count} archived project(s) past the 30-day retention window`);
  }
}
