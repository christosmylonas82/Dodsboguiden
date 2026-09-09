import { Router } from 'express';
import { submitQuizResponse } from '../controllers/quiz.controller.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const quizSubmitRateLimit = rateLimit('quiz-submit', {
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: (minutes) => `Too many quiz submissions. Try again in ${minutes} minutes`,
});

router.post('/responses', quizSubmitRateLimit, asyncHandler(submitQuizResponse));

export default router;
