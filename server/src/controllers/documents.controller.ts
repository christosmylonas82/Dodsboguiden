import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logActivity } from '../lib/activity.js';

const DOCUMENT_TYPES = ['DODSFALLSINTYG', 'TESTAMENTE', 'FULLMAKT', 'FORSAKRING', 'OVRIGT'] as const;

// Mirrors the base64-data-URL pattern already used for profile images
// (auth.controller.ts) — this app has no object storage (S3 etc.) configured,
// and writing to local disk would be lost on every deploy on Railway's
// ephemeral filesystem, so documents are stored the same way images are.
const FILE_DATA_URL_PATTERN =
  /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,([A-Za-z0-9+/]+=*)$/;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const createDocumentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(DOCUMENT_TYPES),
  description: z.string().optional(),
  fileDataUrl: z.string().min(1),
  fileName: z.string().min(1),
});

export async function listDocuments(req: Request, res: Response) {
  const documents = await prisma.document.findMany({
    where: { projectId: req.params.id },
    select: {
      id: true,
      projectId: true,
      title: true,
      type: true,
      description: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      uploadedBy: true,
      uploadedAt: true,
      uploadedByUser: { select: { id: true, name: true } },
    },
    orderBy: { uploadedAt: 'desc' },
  });
  res.json(documents);
}

export async function getDocumentFile(req: Request, res: Response) {
  const { id: projectId, documentId } = req.params;
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || document.projectId !== projectId) {
    throw new HttpError(404, 'Document not found');
  }
  res.json({ fileDataUrl: document.fileData });
}

export async function createDocument(req: Request, res: Response) {
  const body = createDocumentSchema.parse(req.body);
  const projectId = req.params.id;
  const userId = req.user!.userId;

  const match = body.fileDataUrl.match(FILE_DATA_URL_PATTERN);
  if (!match) {
    throw new HttpError(400, 'Only PDF and Word documents are supported');
  }

  const byteLength = Math.ceil((match[2].length * 3) / 4);
  if (byteLength > MAX_FILE_BYTES) {
    throw new HttpError(400, 'File is too large (max 8 MB)');
  }

  const document = await prisma.document.create({
    data: {
      projectId,
      title: body.title,
      type: body.type,
      description: body.description,
      fileData: body.fileDataUrl,
      fileName: body.fileName,
      fileSize: byteLength,
      mimeType: match[1],
      uploadedBy: userId,
    },
    select: {
      id: true,
      projectId: true,
      title: true,
      type: true,
      description: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      uploadedBy: true,
      uploadedAt: true,
      uploadedByUser: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    projectId,
    userId,
    action: `uploaded document "${document.title}"`,
    notify: true,
  });

  res.status(201).json(document);
}

export async function deleteDocument(req: Request, res: Response) {
  const { id: projectId, documentId } = req.params;

  const existing = await prisma.document.findUnique({ where: { id: documentId } });
  if (!existing || existing.projectId !== projectId) {
    throw new HttpError(404, 'Document not found');
  }

  await prisma.document.delete({ where: { id: documentId } });
  res.status(204).end();
}
