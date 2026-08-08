import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler.js';

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    throw new HttpError(403, 'Admin access required');
  }
  next();
}
