import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';

import { IUser } from '../models/User';
import { IWorkspace } from '../models/Workspace';
import { ITeamMember } from '../models/TeamMember';

export interface AuthRequest extends Request {
  user?: IUser;
  workspace?: IWorkspace;
  teamMember?: ITeamMember;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies?.tamad_access_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    const cacheKey = CACHE_KEYS.USER(decoded.id);
    let user = await cache.get<IUser>(cacheKey);
    
    if (!user) {
      const dbUser = await User.findById(decoded.id);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }
      user = dbUser.toObject();
      await cache.set(cacheKey, user, CACHE_TTL.USER);
    } else if (!user.isActive) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }
    
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};
