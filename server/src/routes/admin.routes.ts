import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { auditLog, listAllProjects, listUsers, statistics } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(listUsers));
router.get('/projects', asyncHandler(listAllProjects));
router.get('/statistics', asyncHandler(statistics));
router.get('/audit-log', asyncHandler(auditLog));

export default router;
