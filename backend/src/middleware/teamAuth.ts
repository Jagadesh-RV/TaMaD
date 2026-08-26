// @ts-nocheck
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import TeamMember from '../models/TeamMember';
import Role from '../models/Role';

export const requireTeamMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Try to find teamId from various common places
  const teamId = req.query.teamId || req.body.teamId || req.params.teamId || (req.baseUrl.includes('/teams') ? req.params.id : null);

  if (!teamId) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const member = await TeamMember.findOne({
      teamId,
      userId: req.user._id,
      isDeleted: false,
      status: 'active'
    }).populate('roleId');

    if (!member) {
      return res.status(403).json({ error: 'Not authorized to access this team' });
    }

    req.teamMember = member;
    next();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Team auth error:', error);
    return res.status(500).json({ error: 'Server error checking team permissions' });
  }
};

export const requireTeamRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.teamMember || !req.teamMember.roleId) {
      // If requireTeamMember wasn't run or failed silently (e.g. no teamId found), reject
      return res.status(403).json({ error: 'Not authorized or team member role not found' });
    }
    
    const roleName = req.teamMember.roleId.name;
    if (!roles.includes(roleName)) {
      return res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
    }
    
    next();
  };
};
