import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const createContactSchema = z.object({
  name: z.string().min(1),
  relation: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  relation: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function listContacts(req: Request, res: Response) {
  const contacts = await prisma.contact.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json(contacts);
}

export async function createContact(req: Request, res: Response) {
  const body = createContactSchema.parse(req.body);
  const contact = await prisma.contact.create({
    data: { ...body, projectId: req.params.id },
  });
  res.status(201).json(contact);
}

export async function updateContact(req: Request, res: Response) {
  const body = updateContactSchema.parse(req.body);
  const { id: projectId, contactId } = req.params;

  const existing = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Contact not found');
  }

  const contact = await prisma.contact.update({ where: { id: contactId }, data: body });
  res.json(contact);
}

export async function deleteContact(req: Request, res: Response) {
  const { id: projectId, contactId } = req.params;

  const existing = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Contact not found');
  }

  await prisma.contact.delete({ where: { id: contactId } });
  res.status(204).end();
}
