import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { acceptInvitation, declineInvitation, listMyInvitations } from '../controllers/invitations.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listMyInvitations));
router.post('/:invitationId/accept', asyncHandler(acceptInvitation));
router.post('/:invitationId/decline', asyncHandler(declineInvitation));

export default router;
