import { prisma } from './prisma.js';

const NOTIFICATION_TITLES: [string, string][] = [
  ['changed status of', 'Uppgift uppdaterad'],
  ['assigned', 'Uppgift tilldelad'],
  ['unassigned', 'Uppgift ej tilldelad'],
  ['accepted invite', 'Ny medlem'],
  ['uploaded document', 'Nytt dokument'],
  ['added inventory item', 'Ny egendom registrerad'],
  ['added transaction', 'Ny transaktion registrerad'],
];

function notificationTitle(action: string): string {
  for (const [key, title] of NOTIFICATION_TITLES) {
    if (action.includes(key)) return title;
  }
  return 'Uppdatering';
}

export async function logActivity(params: {
  projectId: string;
  userId: string;
  taskId?: string;
  action: string;
  notify?: boolean;
}) {
  const log = await prisma.activityLog.create({
    data: {
      projectId: params.projectId,
      userId: params.userId,
      taskId: params.taskId,
      action: params.action,
    },
  });

  if (params.notify) {
    const [actor, members] = await Promise.all([
      prisma.user.findUnique({ where: { id: params.userId }, select: { name: true } }),
      prisma.projectMember.findMany({ where: { projectId: params.projectId }, select: { userId: true } }),
    ]);

    const recipientIds = new Set(
      members.map((m) => m.userId).filter((id): id is string => Boolean(id) && id !== params.userId),
    );

    if (recipientIds.size > 0) {
      const message = actor ? `${actor.name}: ${params.action}` : params.action;
      await prisma.notification.createMany({
        data: Array.from(recipientIds).map((userId) => ({
          projectId: params.projectId,
          userId,
          title: notificationTitle(params.action),
          message,
        })),
      });
    }
  }

  return log;
}
