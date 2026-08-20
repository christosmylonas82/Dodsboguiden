import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const TASK_TYPES = ['ADDRESS_CHANGE', 'MAIL_FORWARDING', 'AD_BLOCK'] as const;
const STATUSES = ['PENDING', 'DONE'] as const;

export async function listPostManagementTasks(req: Request, res: Response) {
  const tasks = await prisma.postManagementTask.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json(tasks);
}

const createSchema = z.object({ taskType: z.enum(TASK_TYPES) });

// One row per task type per project — creating an existing type just returns it.
export async function createPostManagementTask(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const task = await prisma.postManagementTask.upsert({
    where: { projectId_taskType: { projectId: req.params.id, taskType: body.taskType } },
    create: { projectId: req.params.id, taskType: body.taskType },
    update: {},
  });
  res.status(201).json(task);
}

const updateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  newAddress: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function updatePostManagementTask(req: Request, res: Response) {
  const body = updateSchema.parse(req.body);
  const { id: projectId, taskId } = req.params;

  const existing = await prisma.postManagementTask.findUnique({ where: { id: taskId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Post management task not found');
  }

  const task = await prisma.postManagementTask.update({
    where: { id: taskId },
    data: {
      ...body,
      completedAt: body.status === 'DONE' ? new Date() : body.status === 'PENDING' ? null : undefined,
    },
  });
  res.json(task);
}

export async function deletePostManagementTask(req: Request, res: Response) {
  const { id: projectId, taskId } = req.params;
  const existing = await prisma.postManagementTask.findUnique({ where: { id: taskId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Post management task not found');
  }
  await prisma.postManagementTask.delete({ where: { id: taskId } });
  res.status(204).end();
}
