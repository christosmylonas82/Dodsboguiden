import { PrismaClient } from '@prisma/client';
import { DEFAULT_CHECKLIST } from '../src/lib/checklistTemplate.js';

const prisma = new PrismaClient();

const NEW_TITLES = [
  'Adressändring för dödsboet (SKV 8403)',
  'Beställ eftersändning av post (12 månader)',
  'Spärra reklam till den avlidne (SPAR)',
];
const AFTER_TITLE = 'Arkivera all dokumentation för långsiktig sparning';

// One-off maintenance script: the post-management mini-module (separate
// PostManagementTask model/UI) was replaced with three regular checklist
// tasks. DEFAULT_CHECKLIST only applies to newly-created projects, so this
// adds the three tasks to every existing project's "Avslut & arvskifte"
// phase, placed right after AFTER_TITLE (orderIndex is a global int per
// project, not per phase, so every task at or after that point is shifted
// up by three first).
async function main() {
  const templateItems = NEW_TITLES.map((title) => {
    const item = DEFAULT_CHECKLIST.find((i) => i.title === title);
    if (!item) throw new Error(`Template item "${title}" not found in DEFAULT_CHECKLIST`);
    return item;
  });

  const projects = await prisma.project.findMany({ select: { id: true } });

  let updated = 0;
  for (const project of projects) {
    const existingTitles = await prisma.task.findMany({
      where: { projectId: project.id, title: { in: NEW_TITLES } },
      select: { title: true },
    });
    const missing = templateItems.filter((item) => !existingTitles.some((t) => t.title === item.title));
    if (missing.length === 0) continue;

    const afterTask = await prisma.task.findFirst({
      where: { projectId: project.id, title: AFTER_TITLE },
    });
    if (!afterTask) continue; // project predates AFTER_TITLE too; skip rather than guess a position

    await prisma.task.updateMany({
      where: { projectId: project.id, orderIndex: { gt: afterTask.orderIndex } },
      data: { orderIndex: { increment: missing.length } },
    });

    for (const [i, item] of missing.entries()) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: item.title,
          description: item.description,
          moreInfo: item.moreInfo,
          url: item.url,
          phase: item.phase,
          priority: item.priority,
          timeEstimate: item.timeEstimate,
          responsibleRole: item.responsibleRole,
          orderIndex: afterTask.orderIndex + 1 + i,
        },
      });
    }
    updated += 1;
  }

  console.log(`Added post-management tasks to ${updated} of ${projects.length} projects`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
