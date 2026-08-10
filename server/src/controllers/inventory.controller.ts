import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const createInventoryItemSchema = z.object({
  type: z.string(),
  value: z.number().int(),
  comments: z.string().optional(),
});

const updateInventoryItemSchema = z.object({
  type: z.string().optional(),
  value: z.number().int().optional(),
  comments: z.string().nullable().optional(),
});

export async function listInventory(req: Request, res: Response) {
  const items = await prisma.inventoryItem.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json(items);
}

export async function createInventoryItem(req: Request, res: Response) {
  const body = createInventoryItemSchema.parse(req.body);
  const item = await prisma.inventoryItem.create({
    data: { ...body, projectId: req.params.id },
  });
  res.status(201).json(item);
}

export async function updateInventoryItem(req: Request, res: Response) {
  const body = updateInventoryItemSchema.parse(req.body);
  const { id: projectId, itemId } = req.params;

  const existing = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Inventory item not found');
  }

  const item = await prisma.inventoryItem.update({ where: { id: itemId }, data: body });
  res.json(item);
}

export async function deleteInventoryItem(req: Request, res: Response) {
  const { id: projectId, itemId } = req.params;

  const existing = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Inventory item not found');
  }

  await prisma.inventoryItem.delete({ where: { id: itemId } });
  res.status(204).end();
}
