import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin';
import AdminSession from '../models/AdminSession';
import User from '../models/User';
import Organization from '../models/Organization';
import Team from '../models/Team';
import Workspace from '../models/Workspace';
import AdminAudit from '../models/AdminAudit';
import { AdminAuthRequest } from '../middleware/adminAuth';

// ==========================================
// AUTHENTICATION
// ==========================================

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const tokenHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12); // 12 hour session

    const session = await AdminSession.create({
      adminId: admin._id,
      tokenHash,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
      expiresAt,
    });

    // Create JWT containing admin ID and session ID
    const token = jwt.sign(
      { adminId: admin._id, sessionId: session._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '12h' }
    );

    admin.lastLogin = new Date();
    await admin.save();

    res.cookie('tamad_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate admin' });
  }
};

export const logoutAdmin = async (req: AdminAuthRequest, res: Response) => {
  try {
    if (req.adminSessionId) {
      await AdminSession.findByIdAndUpdate(req.adminSessionId, {
        isRevoked: true,
      });
    }

    res.clearCookie('tamad_admin_token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout admin' });
  }
};

export const getAdminProfile = async (req: AdminAuthRequest, res: Response) => {
  res.status(200).json({ admin: req.admin });
};

// ==========================================
// METRICS & DASHBOARD
// ==========================================

export const getPlatformMetrics = async (req: AdminAuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();
    
    // Normally we would aggregate more complex metrics here,
    // like active users in the last 24h, storage used, etc.
    // For now, we return the base counts.

    res.status(200).json({
      totalUsers,
      totalOrgs,
      totalTeams,
      totalWorkspaces,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platform metrics' });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

export const getUsers = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-sessions.tokenHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const toggleUserStatus = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-sessions');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// ==========================================
// AUDIT LOGS
// ==========================================

export const getAuditLogs = async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await AdminAudit.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminAudit.countDocuments();

    res.status(200).json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
