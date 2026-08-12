import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logActivity } from '../lib/activity.js';

async function findOwnedInvitation(invitationId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || (invitation.invitedUserId !== userId && invitation.invitedEmail !== user.email)) {
    throw new HttpError(404, 'Invitation not found');
  }

  return { invitation, user };
}

const STATUS_ORDER: Record<string, number> = { PENDING: 0, ACCEPTED: 1, DECLINED: 2 };

export async function listMyInvitations(req: Request, res: Response) {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      OR: [{ invitedUserId: userId }, { invitedEmail: user.email }],
    },
    include: {
      project: { select: { id: true, deceasedName: true } },
      senderUser: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  invitations.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  res.json(invitations);
}

export async function acceptInvitation(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { invitation, user } = await findOwnedInvitation(req.params.invitationId, userId);

  if (invitation.status !== 'PENDING') {
    throw new HttpError(409, 'This invitation has already been responded to');
  }

  await prisma.$transaction(async (tx) => {
    const existingMember = await tx.projectMember.findFirst({
      where: { projectId: invitation.projectId, userId },
    });

    if (!existingMember) {
      await tx.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId,
          email: user.email,
          role: 'MEMBER',
        },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
  });

  await logActivity({
    projectId: invitation.projectId,
    userId,
    action: 'accepted invite',
  });

  res.json({ projectId: invitation.projectId });
}

export async function declineInvitation(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { invitation } = await findOwnedInvitation(req.params.invitationId, userId);

  if (invitation.status !== 'PENDING') {
    throw new HttpError(409, 'This invitation has already been responded to');
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'DECLINED', declinedAt: new Date() },
  });

  res.json({ success: true });
}

export async function revokeInvitation(req: Request, res: Response) {
  const userId = req.user!.userId;
  const invitation = await prisma.invitation.findUnique({ where: { id: req.params.invitationId } });

  if (!invitation) {
    throw new HttpError(404, 'Invitation not found');
  }

  const membership = await prisma.projectMember.findFirst({
    where: { projectId: invitation.projectId, userId },
  });
  if (!membership || membership.role !== 'ADMIN') {
    throw new HttpError(403, 'Project admin access required');
  }

  if (invitation.status !== 'PENDING') {
    throw new HttpError(400, 'Only pending invitations can be revoked');
  }

  await prisma.invitation.delete({ where: { id: invitation.id } });

  res.status(204).end();
}
