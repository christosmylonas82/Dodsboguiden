import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      deletedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
}

export async function listAllProjects(_req: Request, res: Response) {
  const projects = await prisma.project.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true, tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
}

export async function statistics(_req: Request, res: Response) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeUsers, newUsers7Days, totalProjects, activeProjects, totalTasks, completedTasks, activeProjectMemberCounts] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.project.count(),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count(),
      prisma.task.count({ where: { completed: true } }),
      prisma.project.findMany({
        where: { deletedAt: null },
        select: { _count: { select: { members: true } } },
      }),
    ]);

  const avgMembersPerProject = activeProjectMemberCounts.length
    ? activeProjectMemberCounts.reduce((sum, p) => sum + p._count.members, 0) / activeProjectMemberCounts.length
    : 0;

  res.json({
    totalUsers,
    activeUsers,
    newUsers7Days,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    avgMembersPerProject: Number(avgMembersPerProject.toFixed(1)),
  });
}

export async function auditLog(_req: Request, res: Response) {
  const entries = await prisma.auditLog.findMany({
    include: { admin: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'desc' },
  });
  res.json(entries);
}
