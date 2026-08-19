import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectAdmin, requireProjectMember } from '../middleware/projectAccess.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  archiveProject,
  createProject,
  getProject,
  inviteMember,
  listProjects,
  permanentlyDeleteProject,
  removeMember,
  restoreProject,
  updateProject,
} from '../controllers/projects.controller.js';
import { createTask, listActivity, updateTask } from '../controllers/tasks.controller.js';
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from '../controllers/contacts.controller.js';
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventory,
  updateInventoryItem,
} from '../controllers/inventory.controller.js';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from '../controllers/transactions.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', asyncHandler(createProject));
router.get('/', asyncHandler(listProjects));
router.get('/:id', requireProjectMember, asyncHandler(getProject));
router.patch('/:id', requireProjectAdmin, asyncHandler(updateProject));
router.post('/:id/invite', requireProjectAdmin, asyncHandler(inviteMember));
router.patch('/:id/archive', requireProjectAdmin, asyncHandler(archiveProject));
router.patch('/:id/restore', requireProjectAdmin, asyncHandler(restoreProject));
router.delete('/:id/permanent', requireProjectAdmin, asyncHandler(permanentlyDeleteProject));
router.delete('/:id/members/:memberId', requireProjectAdmin, asyncHandler(removeMember));

router.post('/:id/tasks', requireProjectMember, asyncHandler(createTask));
router.put('/:id/tasks/:taskId', requireProjectMember, asyncHandler(updateTask));

router.get('/:id/activity', requireProjectMember, asyncHandler(listActivity));

router.get('/:id/contacts', requireProjectMember, asyncHandler(listContacts));
router.post('/:id/contacts', requireProjectMember, asyncHandler(createContact));
router.patch('/:id/contacts/:contactId', requireProjectMember, asyncHandler(updateContact));
router.delete('/:id/contacts/:contactId', requireProjectMember, asyncHandler(deleteContact));

router.get('/:id/inventory', requireProjectMember, asyncHandler(listInventory));
router.post('/:id/inventory', requireProjectMember, asyncHandler(createInventoryItem));
router.patch('/:id/inventory/:itemId', requireProjectMember, asyncHandler(updateInventoryItem));
router.delete('/:id/inventory/:itemId', requireProjectMember, asyncHandler(deleteInventoryItem));

router.get('/:id/transactions', requireProjectMember, asyncHandler(listTransactions));
router.post('/:id/transactions', requireProjectMember, asyncHandler(createTransaction));
router.patch('/:id/transactions/:transactionId', requireProjectMember, asyncHandler(updateTransaction));
router.delete('/:id/transactions/:transactionId', requireProjectMember, asyncHandler(deleteTransaction));

export default router;
