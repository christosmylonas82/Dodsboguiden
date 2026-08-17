import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  auditLog,
  deleteUser,
  listAllProjects,
  listUsers,
  requestPasswordReset,
  statistics,
  updateUserRole,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(listUsers));
router.patch('/users/:userId/role', asyncHandler(updateUserRole));
router.delete('/users/:userId', asyncHandler(deleteUser));
router.post('/users/:userId/reset-password', asyncHandler(requestPasswordReset));
router.get('/projects', asyncHandler(listAllProjects));
router.get('/statistics', asyncHandler(statistics));
router.get('/audit-log', asyncHandler(auditLog));

export default router;
