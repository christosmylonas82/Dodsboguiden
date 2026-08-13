import { Router } from 'express';
import {
  login,
  markTipsSeen,
  me,
  register,
  removeProfileImage,
  updateEmail,
  updateName,
  updatePassword,
  updateProfileImage,
} from '../controllers/auth.controller.js';
import { deleteAccount, exportData } from '../controllers/gdpr.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.put('/me', requireAuth, asyncHandler(updateName));
router.put('/me/seen-tips', requireAuth, asyncHandler(markTipsSeen));
router.put('/email', requireAuth, asyncHandler(updateEmail));
router.put('/password', requireAuth, asyncHandler(updatePassword));
router.put('/profile-image', requireAuth, asyncHandler(updateProfileImage));
router.delete('/profile-image', requireAuth, asyncHandler(removeProfileImage));
router.delete('/account', requireAuth, asyncHandler(deleteAccount));
router.get('/export-data', requireAuth, asyncHandler(exportData));

export default router;
