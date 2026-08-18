import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { DEFAULT_CHECKLIST } from '../lib/checklistTemplate.js';
import { logActivity } from '../lib/activity.js';
import { calculateDueDate, getDueDateStatus, TASK_DAY_OFFSETS } from '../lib/dueDate.js';

const createProjectSchema = z.object({
  deceasedName: z.string().min(1),
  deceasedDate: z.string().datetime().optional(),
});

export async function createProject(req: Request, res: Response) {
  const body = createProjectSchema.parse(req.body);
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const deceasedDate = body.deceasedDate ? new Date(body.deceasedDate) : undefined;

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      deceasedName: body.deceasedName,
      deceasedDate,
      members: {
        create: { userId, email: user.email, role: 'ADMIN' },
      },
      tasks: {
        create: DEFAULT_CHECKLIST.map((item, index) => ({
          title: item.title,
          description: item.description,
          moreInfo: item.moreInfo,
          url: item.url,
          phase: item.phase,
          priority: item.priority,
          timeEstimate: item.timeEstimate,
          responsibleRole: item.responsibleRole,
          orderIndex: index,
          dueDate:
            deceasedDate && TASK_DAY_OFFSETS[item.title] !== undefined
              ? calculateDueDate(deceasedDate, TASK_DAY_OFFSETS[item.title])
              : undefined,
        })),
      },
    },
    include: { tasks: true, members: true },
  });

  await logActivity({ projectId: project.id, userId, action: 'project_created' });

  res.status(201).json(project);
}

export async function listProjects(req: Request, res: Response) {
  const userId = req.user!.userId;
  const includeArchived = req.query.includeArchived === 'true';

  const projects = await prisma.project.findMany({
    where: includeArchived
      ? { members: { some: { userId, role: 'ADMIN' } } }
      : { deletedAt: null, members: { some: { userId } } },
    include: {
      tasks: { select: { completed: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    projects.map((p) => ({
      id: p.id,
      deceasedName: p.deceasedName,
      status: p.status,
      createdAt: p.createdAt,
      deletedAt: p.deletedAt,
      memberCount: p._count.members,
      progress: p.tasks.length
        ? Math.round((p.tasks.filter((t) => t.completed).length / p.tasks.length) * 100)
        : 0,
    })),
  );
}

export async function getProject(req: Request, res: Response) {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      tasks: {
        orderBy: { orderIndex: 'asc' },
        include: { assignedUser: { select: { id: true, name: true, email: true, profileImageUrl: true } } },
      },
      members: { include: { user: { select: { id: true, name: true, email: true, profileImageUrl: true } } } },
      invitations: {
        where: { status: 'PENDING' },
        include: { invitedUser: { select: { id: true, name: true, email: true, profileImageUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project || project.deletedAt) {
    throw new HttpError(404, 'Project not found');
  }

  res.json({
    ...project,
    tasks: project.tasks.map((task) => ({ ...task, dueDateStatus: getDueDateStatus(task.dueDate) })),
  });
}

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function inviteMember(req: Request, res: Response) {
  const body = inviteSchema.parse(req.body);
  const projectId = req.params.id;

  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, email: body.email },
  });
  if (existingMember) {
    throw new HttpError(409, 'This person is already a member or has a pending invite');
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: { projectId, invitedEmail: body.email, status: 'PENDING' },
  });
  if (existingInvitation) {
    throw new HttpError(409, 'This person is already a member or has a pending invite');
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: body.email } });
  const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      projectId,
      senderUserId: req.user!.userId,
      invitedEmail: body.email,
      invitedUserId: invitedUser?.id,
      invitationToken: randomUUID(),
      tokenExpiresAt,
    },
  });

  await logActivity({
    projectId,
    userId: req.user!.userId,
    action: `invited ${body.email}`,
  });

  res.status(201).json(invitation);
}

const permanentDeleteSchema = z.object({
  confirmationText: z.string().min(1),
});

const updateProjectSchema = z.object({
  deceasedName: z.string().min(1).max(100),
});

export async function updateProject(req: Request, res: Response) {
  const body = updateProjectSchema.parse(req.body);

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { deceasedName: body.deceasedName },
  });

  await logActivity({
    projectId: project.id,
    userId: req.user!.userId,
    action: `renamed the dödsbo to "${body.deceasedName}"`,
  });

  res.json(project);
}

export async function archiveProject(req: Request, res: Response) {
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.json(project);
}

export async function restoreProject(req: Request, res: Response) {
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { deletedAt: null },
  });
  res.json(project);
}

export async function permanentlyDeleteProject(req: Request, res: Response) {
  const body = permanentDeleteSchema.parse(req.body);
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }
  if (!project.deletedAt) {
    throw new HttpError(400, 'Project must be archived before it can be permanently deleted');
  }
  if (body.confirmationText !== project.deceasedName) {
    throw new HttpError(400, 'Confirmation text does not match the project name');
  }

  await prisma.project.delete({ where: { id: project.id } });

  res.status(204).end();
}

export async function removeMember(req: Request, res: Response) {
  const { id: projectId, memberId } = req.params;
  const requestingUserId = req.user!.userId;

  const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (!member || member.projectId !== projectId) {
    throw new HttpError(404, 'Member not found');
  }
  if (member.userId === requestingUserId) {
    throw new HttpError(400, 'You cannot remove yourself from the project');
  }

  await prisma.projectMember.delete({ where: { id: memberId } });

  await logActivity({
    projectId,
    userId: requestingUserId,
    action: `removed member ${member.email}`,
  });

  res.status(204).end();
}
