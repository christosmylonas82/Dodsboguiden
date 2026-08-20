import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function listHousingBenefitNotes(req: Request, res: Response) {
  const notes = await prisma.housingBenefitNote.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notes);
}

// meetsAgeRequirement only reflects the hard 67+ age rule. No income/asset
// eligibility verdict or kr estimate is computed — Pensionsmyndigheten's
// actual bostadstillägg formula isn't available to this app.
const createSchema = z.object({
  age: z.number().int().min(0).max(120),
  incomeBeforeTax: z.number().int().min(0),
  assets: z.number().int().min(0),
  housingCost: z.number().int().min(0),
  notes: z.string().optional(),
});

export async function createHousingBenefitNote(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const note = await prisma.housingBenefitNote.create({
    data: { ...body, projectId: req.params.id, meetsAgeRequirement: body.age >= 67 },
  });
  res.status(201).json(note);
}

export async function deleteHousingBenefitNote(req: Request, res: Response) {
  const { id: projectId, noteId } = req.params;
  const existing = await prisma.housingBenefitNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Note not found');
  }
  await prisma.housingBenefitNote.delete({ where: { id: noteId } });
  res.status(204).end();
}
