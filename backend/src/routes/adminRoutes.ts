import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getPlatformMetrics,
  getUsers,
  toggleUserStatus,
  getAuditLogs,
} from '../controllers/adminController';
import { requireSuperAdmin, requireAdminRole } from '../middleware/adminAuth';
import { logAdminAction } from '../middleware/adminAuditMiddleware';

const router = express.Router();

// Auth Routes (No auth required for login)
router.post('/login', loginAdmin);

// All routes below require Super Admin authentication
router.use(requireSuperAdmin);

// Auth Profile
router.post('/logout', logAdminAction('LOGOUT', 'AdminSession'), logoutAdmin);
router.get('/profile', getAdminProfile);

// Metrics
router.get('/metrics/overview', getPlatformMetrics);

// Users
router.get('/users', requireAdminRole(['superadmin', 'read-only-admin']), getUsers);
router.patch('/users/:userId/status', 
  requireAdminRole(['superadmin']), 
  logAdminAction('TOGGLE_USER_STATUS', 'User'), 
  toggleUserStatus
);

// Audit Logs
router.get('/audits', requireAdminRole(['superadmin']), getAuditLogs);

export default router;
