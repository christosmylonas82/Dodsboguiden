import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  accountStats,
  auditLog,
  authActivityLog,
  deleteUser,
  failedLoginStats,
  featureUsage,
  listAllProjects,
  listUsers,
  projectsPerDay,
  requestPasswordReset,
  resetStats,
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
router.get('/stats/projects-per-day', asyncHandler(projectsPerDay));
router.get('/stats/feature-usage', asyncHandler(featureUsage));
router.get('/auth/account-stats', asyncHandler(accountStats));
router.get('/auth/reset-stats', asyncHandler(resetStats));
router.get('/auth/failed-login-stats', asyncHandler(failedLoginStats));
router.get('/auth/activity-log', asyncHandler(authActivityLog));
router.get('/audit-log', asyncHandler(auditLog));

export default router;
