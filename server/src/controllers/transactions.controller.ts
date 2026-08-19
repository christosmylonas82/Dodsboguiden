import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const TRANSACTION_TYPES = ['COST', 'INCOME'] as const;
const TRANSACTION_CATEGORIES = ['BEGRAVNING', 'JURIDIK', 'MYNDIGHETER', 'FORSALJNING', 'OVRIGT'] as const;

const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  category: z.enum(TRANSACTION_CATEGORIES),
  description: z.string().min(1),
  amount: z.number().int().positive(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  category: z.enum(TRANSACTION_CATEGORIES).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().int().positive().optional(),
  date: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
});

export async function listTransactions(req: Request, res: Response) {
  const transactions = await prisma.transaction.findMany({
    where: { projectId: req.params.id },
    orderBy: { date: 'desc' },
  });
  res.json(transactions);
}

export async function createTransaction(req: Request, res: Response) {
  const body = createTransactionSchema.parse(req.body);
  const transaction = await prisma.transaction.create({
    data: {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      projectId: req.params.id,
    },
  });
  res.status(201).json(transaction);
}

export async function updateTransaction(req: Request, res: Response) {
  const body = updateTransactionSchema.parse(req.body);
  const { id: projectId, transactionId } = req.params;

  const existing = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Transaction not found');
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { ...body, date: body.date ? new Date(body.date) : undefined },
  });
  res.json(transaction);
}

export async function deleteTransaction(req: Request, res: Response) {
  const { id: projectId, transactionId } = req.params;

  const existing = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Transaction not found');
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
  res.status(204).end();
}
