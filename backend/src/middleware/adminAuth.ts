import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import SuperAdmin, { ISuperAdmin } from '../models/SuperAdmin';
import AdminSession from '../models/AdminSession';

export interface AdminAuthRequest extends Request {
  admin?: ISuperAdmin;
  adminSessionId?: string;
}

export const requireSuperAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies?.tamad_admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Admin access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { sessionId: string; adminId: string };
    
    // Verify session
    const session = await AdminSession.findById(decoded.sessionId);
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Admin session invalid or expired' });
    }

    // Verify admin
    const admin = await SuperAdmin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Admin account inactive or not found' });
    }

    // Update session last active in background
    AdminSession.updateOne({ _id: session._id }, { $set: { lastActive: new Date() } }).exec();

    req.admin = admin;
    req.adminSessionId = session._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Admin access denied: Token invalid' });
  }
};

export const requireAdminRole = (allowedRoles: ('superadmin' | 'read-only-admin')[]) => {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Admin role not authorized for this action' });
    }
    next();
  };
};
