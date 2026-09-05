import { Router } from 'express';
import {
  login,
  markOnboardingSeen,
  markTipsSeen,
  me,
  register,
  removeProfileImage,
  resetPassword,
  updateEmail,
  updateName,
  updatePassword,
  updateProfileImage,
  verifyEmail,
} from '../controllers/auth.controller.js';
import { deleteAccount, exportData } from '../controllers/gdpr.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const ONE_HOUR_MS = 60 * 60 * 1000;

const signupRateLimit = rateLimit('signup', {
  windowMs: ONE_HOUR_MS,
  max: 5,
  message: (minutes) => `Too many signup attempts. Try again in ${minutes} minutes`,
});

const loginRateLimit = rateLimit('login', {
  windowMs: ONE_HOUR_MS,
  max: 3,
  message: (minutes) => `Too many login attempts. Try again in ${minutes} minutes`,
});

router.post('/register', signupRateLimit, asyncHandler(register));
router.get('/verify', asyncHandler(verifyEmail));
router.post('/login', loginRateLimit, asyncHandler(login));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/me', requireAuth, asyncHandler(me));
router.put('/me', requireAuth, asyncHandler(updateName));
router.put('/me/seen-tips', requireAuth, asyncHandler(markTipsSeen));
router.put('/me/seen-onboarding', requireAuth, asyncHandler(markOnboardingSeen));
router.put('/email', requireAuth, asyncHandler(updateEmail));
router.put('/password', requireAuth, asyncHandler(updatePassword));
router.put('/profile-image', requireAuth, asyncHandler(updateProfileImage));
router.delete('/profile-image', requireAuth, asyncHandler(removeProfileImage));
router.delete('/account', requireAuth, asyncHandler(deleteAccount));
router.get('/export-data', requireAuth, asyncHandler(exportData));

export default router;
