import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const STATUSES = ['NOT_STARTED', 'MEMORIAL', 'DELETED', 'ARCHIVED'] as const;

export async function getDigitalHeritage(req: Request, res: Response) {
  const projectId = req.params.id;
  const [items, project] = await Promise.all([
    prisma.digitalHeritageItem.findMany({ where: { projectId }, orderBy: { platform: 'asc' } }),
    prisma.project.findUnique({ where: { id: projectId }, select: { selectedArchive: true } }),
  ]);
  if (!project) throw new HttpError(404, 'Project not found');
  res.json({ items, selectedArchive: project.selectedArchive });
}

const createSchema = z.object({ platform: z.string().min(1) });

// One row per platform per project — creating an existing platform just returns it.
export async function createDigitalHeritageItem(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const item = await prisma.digitalHeritageItem.upsert({
    where: { projectId_platform: { projectId: req.params.id, platform: body.platform } },
    create: { projectId: req.params.id, platform: body.platform },
    update: {},
  });
  res.status(201).json(item);
}

const updateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  notes: z.string().nullable().optional(),
});

export async function updateDigitalHeritageItem(req: Request, res: Response) {
  const body = updateSchema.parse(req.body);
  const { id: projectId, itemId } = req.params;

  const existing = await prisma.digitalHeritageItem.findUnique({ where: { id: itemId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Digital heritage item not found');
  }

  const item = await prisma.digitalHeritageItem.update({ where: { id: itemId }, data: body });
  res.json(item);
}

const archiveSchema = z.object({ selectedArchive: z.string().nullable() });

export async function updateSelectedArchive(req: Request, res: Response) {
  const body = archiveSchema.parse(req.body);
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { selectedArchive: body.selectedArchive },
    select: { selectedArchive: true },
  });
  res.json(project);
}
