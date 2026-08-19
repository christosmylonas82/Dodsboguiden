import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export async function listNotifications(req: Request, res: Response) {
  const query = listNotificationsQuerySchema.parse(req.query);
  const userId = req.user!.userId;
  const limit = query.limit ?? 20;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  res.json({ notifications, unreadCount });
}

export async function markNotificationRead(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { notificationId } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new HttpError(404, 'Notification not found');
  }

  const updated = await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  res.json(updated);
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  const userId = req.user!.userId;
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  res.status(204).end();
}
