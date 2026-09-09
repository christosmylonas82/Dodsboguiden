import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const answerField = z.string().max(100).nullable().optional();

const submitQuizSchema = z.object({
  result: z.enum(['fits', 'warning', 'no-fit']),
  domicile: answerField,
  will: answerField,
  familySituation: answerField,
  complexity: answerField,
  company: answerField,
  coOwnership: answerField,
  foreignAssets: answerField,
});

export async function submitQuizResponse(req: Request, res: Response) {
  const body = submitQuizSchema.parse(req.body);

  await prisma.quizResponse.create({
    data: {
      result: body.result,
      domicile: body.domicile ?? null,
      will: body.will ?? null,
      familySituation: body.familySituation ?? null,
      complexity: body.complexity ?? null,
      company: body.company ?? null,
      coOwnership: body.coOwnership ?? null,
      foreignAssets: body.foreignAssets ?? null,
    },
  });

  res.status(201).json({ success: true });
}

const QUESTION_FIELDS = [
  'domicile',
  'will',
  'familySituation',
  'complexity',
  'company',
  'coOwnership',
  'foreignAssets',
] as const;

export async function quizStats(_req: Request, res: Response) {
  const total = await prisma.quizResponse.count();

  const resultCounts = await prisma.quizResponse.groupBy({
    by: ['result'],
    _count: { _all: true },
  });
  const resultBreakdown = resultCounts.map((r) => ({ result: r.result, count: r._count._all }));

  const questionBreakdown: Record<string, { answer: string; count: number }[]> = {};
  for (const field of QUESTION_FIELDS) {
    const rows = await prisma.quizResponse.groupBy({
      by: [field],
      _count: { _all: true },
      where: { [field]: { not: null } },
    });
    questionBreakdown[field] = rows
      .map((r) => ({ answer: String(r[field]), count: r._count._all }))
      .sort((a, b) => b.count - a.count);
  }

  res.json({ total, resultBreakdown, questionBreakdown });
}
