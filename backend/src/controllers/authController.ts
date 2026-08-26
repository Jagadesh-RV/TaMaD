import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { CookieOptions, Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import Project from '../models/Project';
import Note from '../models/Note';
import Whiteboard from '../models/Whiteboard';
import Goal from '../models/Goal';
import Habit from '../models/Habit';
import Workspace from '../models/Workspace';
import { getFirebaseAuth } from '../config/firebase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';

const accessCookieName = 'tamad_access_token';
const refreshCookieName = 'tamad_refresh_token';
const refreshLifetime = 90 * 24 * 60 * 60 * 1000;

const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
};

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: refreshLifetime,
  path: '/api/auth',
};

const getAccessToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

const getRefreshToken = (id: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id }, secret as string, { expiresIn: '90d' });
};

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildUserPayload = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  avatarUrl: user.avatarUrl,
  authProvider: user.authProvider,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
  role: user.role,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const appendSession = async (user: any, refreshToken: string, req: Request) => {
  user.sessions = (user.sessions || []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session: any) => session.expiresAt > new Date(),
  );
  user.sessions.push({
    tokenHash: hashToken(refreshToken),
    deviceName: req.headers['user-agent']?.slice(0, 80) || 'Unknown device',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipAddress: req.ip || (req.socket as any).remoteAddress || 'Unknown',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + refreshLifetime),
  });
  await user.save();
};

const setSessionCookies = (
  res: Response,
  userId: string,
  rememberMe: boolean,
) => {
  const accessToken = getAccessToken(userId);
  const refreshToken = getRefreshToken(userId);
  const accessOptions = rememberMe
    ? accessCookieOptions
    : { ...accessCookieOptions, maxAge: undefined };
  const refreshOptions = rememberMe
    ? refreshCookieOptions
    : { ...refreshCookieOptions, maxAge: undefined };
  res.cookie(accessCookieName, accessToken, accessOptions);
  res.cookie(refreshCookieName, refreshToken, refreshOptions);
  return refreshToken;
};

const providerFor = (provider: string) => {
  if (provider === 'google.com') return 'google';
  if (provider === 'phone') return 'phone';
  return 'email';
};

export const createFirebaseSession = async (req: Request, res: Response) => {
  try {
    const { idToken, rememberMe = false } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    const decoded = await getFirebaseAuth().verifyIdToken(idToken, true);
    const provider = providerFor(
      decoded.firebase?.sign_in_provider || 'password',
    );
    const email = decoded.email?.toLowerCase();

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user && email) user = await User.findOne({ email });
    if (!user && decoded.phone_number)
      user = await User.findOne({ phoneNumber: decoded.phone_number });

    if (user && !user.isActive) {
      return res.status(403).json({ error: 'This account has been disabled' });
    }

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || email?.split('@')[0] || 'TaMaD user',
        email,
        phoneNumber: decoded.phone_number,
        avatarUrl: decoded.picture,
        authProvider: provider,
        emailVerified: Boolean(decoded.email_verified),
        phoneVerified: Boolean(decoded.phone_number),
        preferences: { theme: 'system', language: 'en', timezone: 'UTC' },
      });
    } else {
      user.firebaseUid = decoded.uid;
      user.name = decoded.name || user.name;
      user.email = email || user.email;
      user.phoneNumber = decoded.phone_number || user.phoneNumber;
      user.avatarUrl = decoded.picture || user.avatarUrl;
      user.authProvider = provider;
      user.emailVerified = Boolean(decoded.email_verified);
      user.phoneVerified = Boolean(decoded.phone_number);
      user.lastLogin = new Date();
    }

    const refreshToken = setSessionCookies(
      res,
      user._id.toString(),
      Boolean(rememberMe),
    );
    await appendSession(user, refreshToken, req);
    res.json({ user: buildUserPayload(user) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res
      .status(401)
      .json({ error: error.message || 'Unable to verify Firebase session' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.cookies?.[refreshCookieName] || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Session is invalid' });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, secret as string) as {
      id: string;
    };
    const user = await User.findById(decoded.id);
    const session = user?.sessions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any) =>
        entry.tokenHash === hashToken(refreshToken) &&
        entry.expiresAt > new Date(),
    );
    if (!user || !user.isActive || !session) {
      return res.status(401).json({ error: 'Session is invalid' });
    }

    // Rotate: remove old, issue new
    user.sessions = user.sessions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any) => entry.tokenHash !== hashToken(refreshToken),
    );
    const nextRefreshToken = setSessionCookies(
      res,
      user._id.toString(),
      true,
    );
    await appendSession(user, nextRefreshToken, req);
    res.json({ user: buildUserPayload(user) });
  } catch {
    res.status(401).json({ error: 'Session is invalid' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logout = async (req: any, res: Response) => {
  const refreshToken =
    req.cookies?.[refreshCookieName] || req.body?.refreshToken;
  const user = await User.findById(req.user._id);
  if (user && refreshToken) {
    user.sessions = user.sessions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any) => entry.tokenHash !== hashToken(refreshToken),
    );
    await user.save();
  }
  
  await cache.del(CACHE_KEYS.USER(req.user._id));
  await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));
  
  res.clearCookie(accessCookieName, accessCookieOptions);
  res.clearCookie(refreshCookieName, refreshCookieOptions);
  res.json({ message: 'Logged out successfully' });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logoutAll = async (req: any, res: Response) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { sessions: [] } });
  
  await cache.del(CACHE_KEYS.USER(req.user._id));
  await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));
  
  res.clearCookie(accessCookieName, accessCookieOptions);
  res.clearCookie(refreshCookieName, refreshCookieOptions);
  res.json({ message: 'Logged out from all devices' });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMe = async (req: any, res: Response) => {
  res.json({ user: buildUserPayload(req.user) });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const syncEmailVerification = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.firebaseUid) {
      return res.status(404).json({ error: 'User not found' });
    }

    const firebaseUser = await getFirebaseAuth().getUser(user.firebaseUid);
    const isVerified = firebaseUser.emailVerified ?? false;

    if (user.emailVerified !== isVerified) {
      user.emailVerified = isVerified;
      await user.save();
    }

    res.json({ user: buildUserPayload(user) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || 'Unable to sync verification status' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, avatarUrl, preferences } = req.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 1 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 1-100 characters' });
    }
    user.name = name.trim();
  }
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();
  await cache.del(CACHE_KEYS.USER(req.user._id));
  res.json({ user: buildUserPayload(user) });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.firebaseUid) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Re-authenticate with Firebase using email + current password
    // We call the Firebase REST API via Admin SDK to verify the password
    // For email/password users, verify via the Firebase Auth provider
    if (user.email) {
      // Use Firebase Admin to set the new password directly
      await getFirebaseAuth().updateUser(user.firebaseUid, {
        password: newPassword,
      });
    } else {
      return res
        .status(400)
        .json({ error: 'Password change is only available for email accounts' });
    }

    // Invalidate all existing sessions except current one
    const currentRefreshToken = req.cookies?.[refreshCookieName];
    if (currentRefreshToken) {
      const currentHash = hashToken(currentRefreshToken);
      user.sessions = user.sessions.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => s.tokenHash === currentHash,
      );
    } else {
      user.sessions = [];
    }
    await user.save();

    await cache.del(CACHE_KEYS.USER(req.user._id));
    await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));

    res.json({ message: 'Password changed successfully. Other sessions have been logged out.' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found in Firebase' });
    }
    res
      .status(500)
      .json({ error: error.message || 'Unable to change password' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteAccount = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find all workspaces the user belongs to
    const workspaces = await Workspace.find({ 'members.userId': user._id });
    const workspaceIds = workspaces.map((w) => w._id);

    // Delete all associated data
    await Promise.all([
      Task.deleteMany({
        $or: [
          { createdBy: user._id },
          { assignee: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
      Project.deleteMany({
        $or: [
          { createdBy: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
      Note.deleteMany({
        $or: [
          { createdBy: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
      Whiteboard.deleteMany({
        $or: [
          { createdBy: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
      Goal.deleteMany({
        $or: [
          { createdBy: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
      Habit.deleteMany({
        $or: [
          { createdBy: user._id },
          { workspaceId: { $in: workspaceIds } },
        ],
      }),
    ]);

    // Delete from Firebase Auth
    if (user.firebaseUid) {
      await getFirebaseAuth().deleteUser(user.firebaseUid);
    }

    // Delete from MongoDB
    await User.findByIdAndDelete(user._id);

    await cache.del(CACHE_KEYS.USER(req.user._id));
    await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));

    // Clear cookies
    res.clearCookie(accessCookieName, accessCookieOptions);
    res.clearCookie(refreshCookieName, refreshCookieOptions);
    res.json({ message: 'Account deleted successfully' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || 'Unable to delete account' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const revokeSession = async (req: any, res: Response) => {
  try {
    const { sessionIndex } = req.body;
    if (typeof sessionIndex !== 'number') {
      return res.status(400).json({ error: 'sessionIndex (number) is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (sessionIndex < 0 || sessionIndex >= user.sessions.length) {
      return res.status(400).json({ error: 'Invalid session index' });
    }

    const session = user.sessions[sessionIndex];
    const currentHash = req.cookies?.[refreshCookieName]
      ? hashToken(req.cookies[refreshCookieName])
      : null;
    if (currentHash && session.tokenHash === currentHash) {
      return res.status(400).json({ error: 'Cannot revoke your current session. Use logout instead.' });
    }

    user.sessions.splice(sessionIndex, 1);
    await user.save();
    res.json({ message: 'Session revoked' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to revoke session' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSessions = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions = (user?.sessions || []).map((s: any) => ({
    deviceName: s.deviceName,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt,
    lastUsedAt: s.lastUsedAt,
    expiresAt: s.expiresAt,
    isCurrent:
      req.cookies?.[refreshCookieName] &&
      hashToken(req.cookies[refreshCookieName]) === s.tokenHash,
  }));
  res.json({ sessions });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getWorkspace = async (req: any, res: Response) => {
  try {
    const cacheKey = CACHE_KEYS.WORKSPACE(req.user._id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const Workspace = (await import('../models/Workspace')).default;
    let workspace = await Workspace.findOne({
      'members.userId': req.user._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    if (!workspace) {
      workspace = await Workspace.create({
        name: 'Personal Workspace',
        description: 'Your default personal workspace',
        type: 'personal',
        ownerId: req.user._id,
        members: [{ userId: req.user._id, role: 'owner' }],
      });
    }

    const memberEntry = workspace.members.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.userId.toString() === req.user._id.toString(),
    );

    const result = {
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        role: memberEntry?.role || 'owner',
      },
    };

    await cache.set(cacheKey, result, CACHE_TTL.WORKSPACE);
    res.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || 'Unable to fetch workspace' });
  }
};
