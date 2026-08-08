import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function exportData(req: Request, res: Response) {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          tasks: true,
          activity: { where: { userId } },
        },
      },
    },
  });

  const exportPayload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      gdprConsent: user.gdprConsent,
      consentDate: user.consentDate,
    },
    projects: memberships.map((m) => ({
      id: m.project.id,
      deceasedName: m.project.deceasedName,
      role: m.role,
      status: m.project.status,
      tasks: m.project.tasks,
      myActivity: m.project.activity,
    })),
  };

  res.setHeader('Content-Disposition', 'attachment; filename="dodsboguiden-data-export.json"');
  res.json(exportPayload);
}

export async function deleteAccount(req: Request, res: Response) {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new HttpError(404, 'User not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted-${userId}@dodsboguiden.invalid`,
        name: 'Raderad användare',
        passwordHash: '',
      },
    });

    // Projects this user owns with no other members are soft-deleted too;
    // projects shared with others keep running (ownership stays on record).
    const soloOwnedProjects = await tx.project.findMany({
      where: { ownerId: userId, deletedAt: null },
      include: { _count: { select: { members: true } } },
    });

    const soloProjectIds = soloOwnedProjects
      .filter((p) => p._count.members <= 1)
      .map((p) => p.id);

    if (soloProjectIds.length > 0) {
      await tx.project.updateMany({
        where: { id: { in: soloProjectIds } },
        data: { deletedAt: new Date() },
      });
    }
  });

  res.status(204).send();
}
