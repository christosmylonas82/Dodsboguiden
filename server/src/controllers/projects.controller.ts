import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { DEFAULT_CHECKLIST } from '../lib/checklistTemplate.js';
import { logActivity } from '../lib/activity.js';

const createProjectSchema = z.object({
  deceasedName: z.string().min(1),
});

export async function createProject(req: Request, res: Response) {
  const body = createProjectSchema.parse(req.body);
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      deceasedName: body.deceasedName,
      members: {
        create: { userId, email: user.email, role: 'ADMIN' },
      },
      tasks: {
        create: DEFAULT_CHECKLIST.map((item, index) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          phase: item.phase,
          orderIndex: index,
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

  const projects = await prisma.project.findMany({
    where: { deletedAt: null, members: { some: { userId } } },
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
        include: { assignedUser: { select: { id: true, name: true, email: true } } },
      },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!project || project.deletedAt) {
    throw new HttpError(404, 'Project not found');
  }

  res.json(project);
}

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function inviteMember(req: Request, res: Response) {
  const body = inviteSchema.parse(req.body);
  const projectId = req.params.id;

  const existing = await prisma.projectMember.findFirst({
    where: { projectId, email: body.email },
  });
  if (existing) {
    throw new HttpError(409, 'This person is already a member or has a pending invite');
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: body.email } });

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      email: body.email,
      userId: invitedUser?.id,
      role: 'MEMBER',
    },
  });

  await logActivity({
    projectId,
    userId: req.user!.userId,
    action: `invited ${body.email}`,
  });

  res.status(201).json(member);
}
