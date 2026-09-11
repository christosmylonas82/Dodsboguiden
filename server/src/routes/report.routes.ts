import { Router } from 'express';
import { submitReport } from '../controllers/report.controller.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const reportRateLimit = rateLimit('report', {
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: (minutes) => `Too many reports sent. Try again in ${minutes} minutes`,
});

router.post('/', requireAuth, reportRateLimit, asyncHandler(submitReport));

export default router;
