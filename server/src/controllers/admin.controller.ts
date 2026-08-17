import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logAudit } from '../lib/audit.js';
import { createPasswordResetToken } from '../lib/passwordReset.js';
import { sendPasswordResetEmail } from '../lib/email.js';

const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'email', 'name', 'role']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export async function listUsers(req: Request, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  const search = query.search?.trim();
  const sortField = query.sort ?? 'createdAt';
  const order = query.order ?? 'desc';

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      deletedAt: true,
      _count: { select: { memberships: true } },
    },
    orderBy: { [sortField]: order },
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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    newUsers7Days,
    totalProjects,
    activeProjects,
    projectsLast7Days,
    projectsLast30Days,
    totalTasks,
    completedTasks,
    activeProjectMemberCounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.project.count(),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    prisma.project.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
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
    projectsLast7Days,
    projectsLast30Days,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0,
    avgMembersPerProject: Number(avgMembersPerProject.toFixed(1)),
  });
}

export async function projectsPerDay(_req: Request, res: Response) {
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const projects = await prisma.project.findMany({
    where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const dataByDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dataByDay.set(date.toISOString().split('T')[0], 0);
  }

  for (const project of projects) {
    const dateStr = project.createdAt.toISOString().split('T')[0];
    if (dataByDay.has(dateStr)) {
      dataByDay.set(dateStr, (dataByDay.get(dateStr) ?? 0) + 1);
    }
  }

  const data = Array.from(dataByDay.entries()).map(([date, count]) => ({ date, projects: count }));
  res.json({ data });
}

const FEATURE_LABELS: [string, string][] = [
  ['project_created', 'Skapa dödsbo'],
  ['added task', 'Lägg till uppgift'],
  ['changed status of', 'Uppdatera uppgift'],
  ['invited', 'Bjuda in medlem'],
  ['renamed the dödsbo', 'Byta namn'],
  ['removed member', 'Ta bort medlem'],
  ['accepted invite', 'Acceptera inbjudan'],
];

function labelForAction(action: string): string {
  for (const [key, label] of FEATURE_LABELS) {
    if (action.includes(key)) return label;
  }
  return 'Övrigt';
}

export async function featureUsage(_req: Request, res: Response) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const entries = await prisma.activityLog.findMany({
    where: { timestamp: { gte: thirtyDaysAgo } },
    select: { action: true },
  });

  const counts = new Map<string, number>();
  for (const entry of entries) {
    const label = labelForAction(entry.action);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const data = Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([feature, uses]) => ({ feature, uses }));

  res.json({ data });
}

export async function auditLog(_req: Request, res: Response) {
  const entries = await prisma.auditLog.findMany({
    include: { admin: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'desc' },
  });
  res.json(entries);
}

const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER']),
});

export async function updateUserRole(req: Request, res: Response) {
  const body = updateUserRoleSchema.parse(req.body);
  const { userId } = req.params;
  const adminId = req.user!.userId;

  if (userId === adminId && body.role === 'USER') {
    throw new HttpError(400, 'Du kan inte demota dig själv');
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: body.role },
    select: { id: true, email: true, name: true, role: true },
  });

  await logAudit({
    adminId,
    action: body.role === 'ADMIN' ? 'promoted user to admin' : 'demoted user to member',
    targetType: 'user',
    targetId: userId,
  });

  res.json({ user });
}

export async function deleteUser(req: Request, res: Response) {
  const { userId } = req.params;
  const adminId = req.user!.userId;

  if (userId === adminId) {
    throw new HttpError(400, 'Du kan inte radera dig själv');
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: `deleted-${userId}@dodsboguiden.invalid`,
      name: 'Raderad användare',
      passwordHash: '',
    },
  });

  await logAudit({
    adminId,
    action: `deleted user ${target.email}`,
    targetType: 'user',
    targetId: userId,
  });

  res.status(204).send();
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { userId } = req.params;
  const adminId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  const token = await createPasswordResetToken(userId);
  const resetLink = `${process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetLink);

  await logAudit({
    adminId,
    action: `requested password reset for ${user.email}`,
    targetType: 'user',
    targetId: userId,
  });

  // No real email provider is configured yet (see lib/email.ts), so the link is
  // returned here too — otherwise the admin would have no way to actually deliver it.
  res.json({ email: user.email, resetLink });
}
