import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logActivity } from '../lib/activity.js';

const createTaskSchema = z.object({
  title: z.string().min(1),
  phase: z.enum(['Förberedelser', 'Förrättningen', 'Efter förrättningen']),
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

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export async function updateTask(req: Request, res: Response) {
  const body = updateTaskSchema.parse(req.body);
  const { id: projectId, taskId } = req.params;
  const userId = req.user!.userId;

  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask || existingTask.projectId !== projectId) {
    throw new HttpError(404, 'Task not found');
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.completed !== undefined
        ? {
            completed: body.completed,
            completedBy: body.completed ? userId : null,
            completedAt: body.completed ? new Date() : null,
          }
        : {}),
    },
  });

  if (body.completed !== undefined && body.completed !== existingTask.completed) {
    await logActivity({
      projectId,
      userId,
      taskId: task.id,
      action: body.completed ? `completed task "${task.title}"` : `reopened task "${task.title}"`,
    });
  }

  res.json(task);
}

export async function listActivity(req: Request, res: Response) {
  const activity = await prisma.activityLog.findMany({
    where: { projectId: req.params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'desc' },
  });

  res.json(activity);
}
