import { PrismaClient } from '@prisma/client';
import { DEFAULT_CHECKLIST } from '../src/lib/checklistTemplate.js';

const prisma = new PrismaClient();

// One-off maintenance script: fills in `url` (and future template fields, if
// extended) for tasks created before a checklist field existed on the schema,
// by matching each task's title against the current DEFAULT_CHECKLIST. Tasks
// whose title predates the current template (no exact match) are left as-is.
async function main() {
  const urlByTitle = new Map(DEFAULT_CHECKLIST.map((item) => [item.title, item.url]));

  const tasksMissingUrl = await prisma.task.findMany({
    where: { url: null },
    select: { id: true, title: true },
  });

  let updated = 0;
  for (const task of tasksMissingUrl) {
    const url = urlByTitle.get(task.title);
    if (!url) continue;
    await prisma.task.update({ where: { id: task.id }, data: { url } });
    updated += 1;
  }

  console.log(`Backfilled url for ${updated} of ${tasksMissingUrl.length} tasks missing a url`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
