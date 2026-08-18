import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logActivity } from '../lib/activity.js';

const createTaskSchema = z.object({
  title: z.string().min(1),
  phase: z.enum([
    'Direkt efter dödsfall',
    'Begravning & ceremoni',
    'Inför bouppteckning',
    'Under bouppteckning',
    'Avslut & arvskifte',
  ]),
});

export async function createTask(req: Request, res: Response) {
  const body = createTaskSchema.parse(req.body);
  const projectId = req.params.id;

  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { orderIndex: 'desc' },
  });

  const task = await prisma.task.create({
    data: {
      projectId,
      title: body.title,
      phase: body.phase,
      orderIndex: (lastTask?.orderIndex ?? -1) + 1,
    },
  });

  await logActivity({
    projectId,
    userId: req.user!.userId,
    taskId: task.id,
    action: `added task "${task.title}"`,
  });

  res.status(201).json(task);
}

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'] as const;

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function updateTask(req: Request, res: Response) {
  const body = updateTaskSchema.parse(req.body);
  const { id: projectId, taskId } = req.params;
  const userId = req.user!.userId;

  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask || existingTask.projectId !== projectId) {
    throw new HttpError(404, 'Task not found');
  }

  if (body.assignedTo) {
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: body.assignedTo },
    });
    if (!member) {
      throw new HttpError(400, 'Assignee must be a member of this project');
    }
  }

  const nextStatus = body.status ?? (body.completed !== undefined ? (body.completed ? 'DONE' : 'PENDING') : undefined);
  const statusChanged = nextStatus !== undefined && nextStatus !== existingTask.status;
  const assignedToChanged = body.assignedTo !== undefined && body.assignedTo !== existingTask.assignedTo;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(nextStatus !== undefined
        ? {
            status: nextStatus,
            completed: nextStatus === 'DONE',
            completedBy: nextStatus === 'DONE' ? userId : null,
            completedAt: nextStatus === 'DONE' ? new Date() : null,
          }
        : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
    },
    include: {
      assignedUser: { select: { id: true, name: true, email: true, profileImageUrl: true } },
    },
  });

  if (statusChanged) {
    await logActivity({
      projectId,
      userId,
      taskId: task.id,
      action: `changed status of "${task.title}" to ${nextStatus}`,
    });
  }

  if (assignedToChanged) {
    await logActivity({
      projectId,
      userId,
      taskId: task.id,
      action: task.assignedUser
        ? `assigned "${task.title}" to ${task.assignedUser.name}`
        : `unassigned "${task.title}"`,
    });
  }

  res.json(task);
}

export async function listActivity(req: Request, res: Response) {
  const limitParam = Number(req.query.limit);
  const take = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : undefined;

  const activity = await prisma.activityLog.findMany({
    where: { projectId: req.params.id },
    include: { user: { select: { id: true, name: true, profileImageUrl: true } } },
    orderBy: { timestamp: 'desc' },
    take,
  });

  res.json(activity);
}
