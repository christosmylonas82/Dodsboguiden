import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function listSurvivingPensionNotes(req: Request, res: Response) {
  const notes = await prisma.survivingPensionNote.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notes);
}

// No estimated amount is stored or computed here — Pensionsmyndigheten's
// actual formula isn't available to this app, so we only record the
// eligibility-relevant facts the user entered, for their own reference.
const createSchema = z
  .object({
    pensionType: z.enum(['BARNPENSION', 'OMSTALLNINGSPENSION']),
    childAge: z.number().int().min(0).max(25).optional(),
    studyingGymnasium: z.boolean().optional(),
    survivorAge: z.number().int().min(18).max(67).optional(),
    hasChildren: z.boolean().optional(),
    notes: z.string().optional(),
  })
  .refine((body) => (body.pensionType === 'BARNPENSION' ? body.childAge !== undefined : body.survivorAge !== undefined), {
    message: 'childAge is required for BARNPENSION, survivorAge is required for OMSTALLNINGSPENSION',
  });

export async function createSurvivingPensionNote(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const note = await prisma.survivingPensionNote.create({
    data: { ...body, projectId: req.params.id },
  });
  res.status(201).json(note);
}

export async function deleteSurvivingPensionNote(req: Request, res: Response) {
  const { id: projectId, noteId } = req.params;
  const existing = await prisma.survivingPensionNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Note not found');
  }
  await prisma.survivingPensionNote.delete({ where: { id: noteId } });
  res.status(204).end();
}
