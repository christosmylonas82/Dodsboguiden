import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const contactRateLimit = rateLimit('contact', {
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: (minutes) => `Too many messages sent. Try again in ${minutes} minutes`,
});

router.post('/', contactRateLimit, asyncHandler(submitContact));

export default router;
