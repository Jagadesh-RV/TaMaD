import express from 'express';
import { getRules, createRule, updateRule, deleteRule } from '../controllers/automationController';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Require workspace membership (workspaceId provided in query for GET, or body for POST)
router.use(requireWorkspaceMember);

router.route('/')
  .get(getRules)
  .post(createRule);

router.route('/:id')
  .put(updateRule)
  .delete(deleteRule);

export default router;
