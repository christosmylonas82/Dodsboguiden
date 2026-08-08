import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from './errorHandler.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      projectMember?: { id: string; role: 'ADMIN' | 'MEMBER' };
    }
  }
}

async function loadMembership(req: Request) {
  const projectId = req.params.id;
  const userId = req.user?.userId;

  if (!projectId || !userId) {
    throw new HttpError(400, 'Missing project id or user');
  }

  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });

  if (!membership) {
    throw new HttpError(403, 'You are not a member of this project');
  }

  return membership;
}

export async function requireProjectMember(req: Request, _res: Response, next: NextFunction) {
  try {
    const membership = await loadMembership(req);
    req.projectMember = { id: membership.id, role: membership.role };
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireProjectAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const membership = await loadMembership(req);
    if (membership.role !== 'ADMIN') {
      throw new HttpError(403, 'Project admin access required');
    }
    req.projectMember = { id: membership.id, role: membership.role };
    next();
  } catch (err) {
    next(err);
  }
}
