import { Router } from 'express';
import { login, markTipsSeen, me, register } from '../controllers/auth.controller.js';
import { deleteAccount, exportData } from '../controllers/gdpr.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.put('/me/seen-tips', requireAuth, asyncHandler(markTipsSeen));
router.delete('/account', requireAuth, asyncHandler(deleteAccount));
router.get('/export-data', requireAuth, asyncHandler(exportData));

export default router;
