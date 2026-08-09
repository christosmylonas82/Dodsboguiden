import { PrismaClient } from '@prisma/client';
import { DEFAULT_CHECKLIST } from '../src/lib/checklistTemplate.js';

const prisma = new PrismaClient();

// One-off maintenance script: syncs `url` on existing tasks to the current
// DEFAULT_CHECKLIST by exact title match, overwriting whatever was there
// before. Tasks whose title predates the current template are left as-is.
async function main() {
  const urlByTitle = new Map(DEFAULT_CHECKLIST.map((item) => [item.title, item.url]));

  const tasks = await prisma.task.findMany({ select: { id: true, title: true, url: true } });

  let updated = 0;
  for (const task of tasks) {
    const url = urlByTitle.get(task.title);
    if (!url || url === task.url) continue;
    await prisma.task.update({ where: { id: task.id }, data: { url } });
    updated += 1;
  }

  console.log(`Synced url for ${updated} of ${tasks.length} tasks`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
