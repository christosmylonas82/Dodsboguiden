import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logAudit } from '../lib/audit.js';
import { createPasswordResetToken } from '../lib/passwordReset.js';
import { sendPasswordResetEmail } from '../lib/email.js';
import { scrubAuthEventsForUser } from '../lib/authEvent.js';

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

  const recentLogins = await prisma.authEvent.findMany({
    where: { userId: { in: users.map((u) => u.id) }, action: 'login_success' },
    select: { userId: true, ipAddress: true, country: true, city: true, timestamp: true },
    orderBy: { timestamp: 'desc' },
  });

  const lastLoginByUser = new Map<string, (typeof recentLogins)[number]>();
  for (const login of recentLogins) {
    if (login.userId && !lastLoginByUser.has(login.userId)) {
      lastLoginByUser.set(login.userId, login);
    }
  }

  const usersWithLastLogin = users.map((u) => {
    const login = lastLoginByUser.get(u.id);
    return {
      ...u,
      lastLogin: login
        ? { ipAddress: login.ipAddress, country: login.country, city: login.city, timestamp: login.timestamp }
        : null,
    };
  });

  res.json(usersWithLastLogin);
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

const MAX_RANGE_DAYS = 366;

const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function resolveDateRange(query: { startDate?: string; endDate?: string }, defaultDays: number): { start: Date; end: Date } {
  const end = query.endDate ? new Date(query.endDate) : new Date();
  if (query.endDate) end.setHours(23, 59, 59, 999);

  const start = query.startDate ? new Date(query.startDate) : new Date(Date.now() - defaultDays * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new HttpError(400, 'Invalid date range');
  }
  const spanDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  if (spanDays > MAX_RANGE_DAYS) {
    throw new HttpError(400, `Date range cannot exceed ${MAX_RANGE_DAYS} days`);
  }

  return { start, end };
}

function calculateTrend(data: { projects: number }[]): { direction: 'up' | 'down' | 'flat'; percentChange: number } {
  if (data.length < 2) return { direction: 'flat', percentChange: 0 };

  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.projects, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.projects, 0) / secondHalf.length;

  const percentChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  return {
    direction: percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'flat',
    percentChange: Math.round(percentChange * 10) / 10,
  };
}

export async function projectsPerDay(req: Request, res: Response) {
  const query = dateRangeQuerySchema.parse(req.query);
  const { start, end } = resolveDateRange(query, 30);

  const projects = await prisma.project.findMany({
    where: { deletedAt: null, createdAt: { gte: start, lte: end } },
    select: { createdAt: true },
  });

  const dataByDay = new Map<string, number>();
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    dataByDay.set(cursor.toISOString().split('T')[0], 0);
  }

  for (const project of projects) {
    const dateStr = project.createdAt.toISOString().split('T')[0];
    if (dataByDay.has(dateStr)) {
      dataByDay.set(dateStr, (dataByDay.get(dateStr) ?? 0) + 1);
    }
  }

  const data = Array.from(dataByDay.entries()).map(([date, count]) => ({ date, projects: count }));
  res.json({ data, trend: calculateTrend(data) });
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

export async function featureUsage(req: Request, res: Response) {
  const query = dateRangeQuerySchema.parse(req.query);
  const { start, end } = resolveDateRange(query, 30);

  const entries = await prisma.activityLog.findMany({
    where: { timestamp: { gte: start, lte: end } },
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

// Prevents CSV/formula injection when a cell is opened in Excel/Sheets and
// guards against embedded commas, quotes, or newlines in free-text fields.
function csvCell(value: string | number): string {
  const str = String(value);
  const escaped = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${escaped.replace(/"/g, '""')}"`;
}

const exportCsvQuerySchema = dateRangeQuerySchema.extend({
  dataType: z.enum(['projects', 'features']).optional(),
});

export async function exportStatsCsv(req: Request, res: Response) {
  const query = exportCsvQuerySchema.parse(req.query);
  const { start, end } = resolveDateRange(query, 30);
  const dataType = query.dataType ?? 'projects';

  let csvContent = '';

  if (dataType === 'projects') {
    const projects = await prisma.project.findMany({
      where: { createdAt: { gte: start, lte: end }, deletedAt: null },
      select: { id: true, deceasedName: true, createdAt: true, _count: { select: { members: true } } },
    });

    csvContent = 'Datum,Dödsbo-ID,Namn,Medlemmar\n';
    for (const p of projects) {
      const date = p.createdAt.toISOString().split('T')[0];
      csvContent += [csvCell(date), csvCell(p.id), csvCell(p.deceasedName), csvCell(p._count.members)].join(',') + '\n';
    }
  } else {
    const activities = await prisma.activityLog.findMany({
      where: { timestamp: { gte: start, lte: end } },
      select: { action: true, timestamp: true },
    });

    const counts = new Map<string, { count: number; lastUsed: Date }>();
    for (const entry of activities) {
      const label = labelForAction(entry.action);
      const existing = counts.get(label);
      if (!existing || entry.timestamp > existing.lastUsed) {
        counts.set(label, { count: (existing?.count ?? 0) + 1, lastUsed: existing ? existing.lastUsed : entry.timestamp });
      } else {
        existing.count += 1;
      }
    }

    csvContent = 'Funktion,Antal,Senast använd\n';
    for (const [feature, stats] of Array.from(counts.entries()).sort(([, a], [, b]) => b.count - a.count)) {
      csvContent += [csvCell(feature), csvCell(stats.count), csvCell(stats.lastUsed.toISOString())].join(',') + '\n';
    }
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="dodsboguiden-stats-${dataType}-${Date.now()}.csv"`);
  res.send(csvContent);
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

  await scrubAuthEventsForUser(userId);

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

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function accountStats(_req: Request, res: Response) {
  const today = startOfToday();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newToday, newThisWeek, totalActive] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  res.json({ accounts: { newToday, newThisWeek, totalActive } });
}

export async function resetStats(_req: Request, res: Response) {
  const today = startOfToday();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [requestsToday, requestsThisWeek, usedToday, expiredUnused] = await Promise.all([
    prisma.passwordReset.count({ where: { createdAt: { gte: today } } }),
    prisma.passwordReset.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.passwordReset.count({ where: { usedAt: { gte: today } } }),
    prisma.passwordReset.count({ where: { usedAt: null, expiresAt: { lt: new Date() } } }),
  ]);

  res.json({ reset: { requestsToday, requestsThisWeek, usedToday, expiredUnused } });
}

export async function failedLoginStats(_req: Request, res: Response) {
  const today = startOfToday();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [failedToday, failedThisWeek, successToday] = await Promise.all([
    prisma.authEvent.count({ where: { action: 'login_failed', timestamp: { gte: today } } }),
    prisma.authEvent.count({ where: { action: 'login_failed', timestamp: { gte: sevenDaysAgo } } }),
    prisma.authEvent.count({ where: { action: 'login_success', timestamp: { gte: today } } }),
  ]);

  res.json({ failedLogin: { failedToday, failedThisWeek, successToday } });
}

const AUTH_ACTION_LABELS: Record<string, string> = {
  login_success: 'Lyckad inloggning',
  login_failed: 'Misslyckad inloggning',
  password_reset_requested: 'Lösenordsåterställning begärd',
  password_reset_completed: 'Lösenord återställt',
};

const authActivityLogQuerySchema = z.object({
  range: z.enum(['today', 'week', 'all']).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export async function authActivityLog(req: Request, res: Response) {
  const query = authActivityLogQuerySchema.parse(req.query);
  const limit = query.limit ?? 50;

  const since =
    query.range === 'today' ? startOfToday() : query.range === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined;

  const [authEvents, resets] = await Promise.all([
    prisma.authEvent.findMany({
      where: since ? { timestamp: { gte: since } } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
    }),
    prisma.passwordReset.findMany({
      where: since ? { createdAt: { gte: since } } : undefined,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  const successUserIds = Array.from(
    new Set(authEvents.filter((e) => e.action === 'login_success' && e.userId).map((e) => e.userId as string)),
  );
  const loginHistory = successUserIds.length
    ? await prisma.authEvent.findMany({
        where: { userId: { in: successUserIds }, action: 'login_success' },
        select: { id: true, userId: true, ipAddress: true, timestamp: true },
        orderBy: { timestamp: 'asc' },
      })
    : [];

  const newIpEventIds = new Set<string>();
  const seenIpsByUser = new Map<string, Set<string>>();
  for (const login of loginHistory) {
    if (!login.userId || !login.ipAddress) continue;
    const seen = seenIpsByUser.get(login.userId) ?? new Set<string>();
    if (seen.size > 0 && !seen.has(login.ipAddress)) {
      newIpEventIds.add(login.id);
    }
    seen.add(login.ipAddress);
    seenIpsByUser.set(login.userId, seen);
  }

  const events = [
    ...authEvents.map((e) => ({
      id: e.id,
      action: AUTH_ACTION_LABELS[e.action] ?? e.action,
      email: e.email,
      ipAddress: e.ipAddress,
      country: e.country,
      city: e.city,
      userAgent: e.userAgent,
      isNewIp: newIpEventIds.has(e.id),
      timestamp: e.timestamp,
    })),
    ...resets.map((r) => ({
      id: `${r.id}-requested`,
      action: AUTH_ACTION_LABELS.password_reset_requested,
      email: r.user.email,
      ipAddress: null,
      country: null,
      city: null,
      userAgent: null,
      isNewIp: false,
      timestamp: r.createdAt,
    })),
    ...resets
      .filter((r) => r.usedAt)
      .map((r) => ({
        id: `${r.id}-used`,
        action: AUTH_ACTION_LABELS.password_reset_completed,
        email: r.user.email,
        ipAddress: null,
        country: null,
        city: null,
        userAgent: null,
        isNewIp: false,
        timestamp: r.usedAt as Date,
      })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  res.json({ events });
}
