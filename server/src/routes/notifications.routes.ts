import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notifications.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listNotifications));
router.patch('/:notificationId/read', asyncHandler(markNotificationRead));
router.patch('/read-all', asyncHandler(markAllNotificationsRead));

export default router;
