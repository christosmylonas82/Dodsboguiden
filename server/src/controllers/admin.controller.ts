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
  const [totalUsers, activeUsers, totalProjects, activeProjects, totalTasks, completedTasks] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count(),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count(),
      prisma.task.count({ where: { completed: true } }),
    ]);

  res.json({
    totalUsers,
    activeUsers,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
  });
}

export async function auditLog(_req: Request, res: Response) {
  const entries = await prisma.auditLog.findMany({
    include: { admin: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'desc' },
  });
  res.json(entries);
}
