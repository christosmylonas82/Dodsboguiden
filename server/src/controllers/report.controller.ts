import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { sendProblemReportEmail } from '../lib/email.js';

const reportSchema = z.object({
  message: z.string().min(1).max(5000),
  pageUrl: z.string().max(500).optional(),
});

export async function submitReport(req: Request, res: Response) {
  const body = reportSchema.parse(req.body);
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const report = await prisma.problemReport.create({
    data: { userId, message: body.message, pageUrl: body.pageUrl },
  });

  try {
    await sendProblemReportEmail(user.name, user.email, body.message, body.pageUrl);
  } catch (err) {
    console.error('[report] Failed to send problem-report notification email:', err);
  }

  res.status(201).json({ success: true, report });
}
