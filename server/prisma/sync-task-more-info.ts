import { PrismaClient } from '@prisma/client';
import { DEFAULT_CHECKLIST } from '../src/lib/checklistTemplate.js';

const prisma = new PrismaClient();

// One-off maintenance script: syncs `moreInfo` on existing tasks to the
// current DEFAULT_CHECKLIST by exact title match. Tasks whose title predates
// the current template are left as-is.
async function main() {
  const moreInfoByTitle = new Map(DEFAULT_CHECKLIST.map((item) => [item.title, item.moreInfo]));

  const tasks = await prisma.task.findMany({ select: { id: true, title: true, moreInfo: true } });

  let updated = 0;
  for (const task of tasks) {
    const moreInfo = moreInfoByTitle.get(task.title);
    if (!moreInfo || moreInfo === task.moreInfo) continue;
    await prisma.task.update({ where: { id: task.id }, data: { moreInfo } });
    updated += 1;
  }

  console.log(`Synced moreInfo for ${updated} of ${tasks.length} tasks`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
