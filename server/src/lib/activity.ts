import { prisma } from './prisma.js';

export function logActivity(params: {
  projectId: string;
  userId: string;
  taskId?: string;
  action: string;
}) {
  return prisma.activityLog.create({
    data: {
      projectId: params.projectId,
      userId: params.userId,
      taskId: params.taskId,
      action: params.action,
    },
  });
}
