import { PrismaClient } from '@prisma/client';
import { DEFAULT_CHECKLIST } from '../src/lib/checklistTemplate.js';

const prisma = new PrismaClient();

const NEW_TITLE = 'Skriv fullmakt för dödsbo och praktiska ärenden';
const AFTER_TITLE = 'Avgör om bodelning behövs före bouppteckning';

// One-off maintenance script: DEFAULT_CHECKLIST only gets applied to
// projects created from now on. This adds the newly-added "fullmakt" task to
// every project that predates it, placed right after AFTER_TITLE within
// "Inför bouppteckning" (orderIndex is a global int per project, not per
// phase, so every task at or after that point is shifted up by one first).
async function main() {
  const template = DEFAULT_CHECKLIST.find((item) => item.title === NEW_TITLE);
  if (!template) throw new Error(`Template item "${NEW_TITLE}" not found in DEFAULT_CHECKLIST`);

  const projects = await prisma.project.findMany({ select: { id: true } });

  let updated = 0;
  for (const project of projects) {
    const alreadyHasTask = await prisma.task.findFirst({
      where: { projectId: project.id, title: NEW_TITLE },
    });
    if (alreadyHasTask) continue;

    const afterTask = await prisma.task.findFirst({
      where: { projectId: project.id, title: AFTER_TITLE },
    });
    if (!afterTask) continue; // project predates AFTER_TITLE too; skip rather than guess a position

    await prisma.task.updateMany({
      where: { projectId: project.id, orderIndex: { gt: afterTask.orderIndex } },
      data: { orderIndex: { increment: 1 } },
    });

    await prisma.task.create({
      data: {
        projectId: project.id,
        title: template.title,
        description: template.description,
        moreInfo: template.moreInfo,
        url: template.url,
        phase: template.phase,
        priority: template.priority,
        timeEstimate: template.timeEstimate,
        responsibleRole: template.responsibleRole,
        orderIndex: afterTask.orderIndex + 1,
      },
    });
    updated += 1;
  }

  console.log(`Added "${NEW_TITLE}" to ${updated} of ${projects.length} projects`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
