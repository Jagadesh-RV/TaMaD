import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendMail } from '../utils/mailer';

const getAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
};

const getRefreshToken = (id: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'tamad-refresh-secret';
  return jwt.sign({ id }, secret, { expiresIn: '90d' });
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const buildUserPayload = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const appendSession = async (user: any, refreshToken: string, req: Request) => {
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  user.sessions = user.sessions || [];
  user.sessions.push({
    tokenHash: hashToken(refreshToken),
    deviceName: req.headers['user-agent']?.slice(0, 80) || 'Unknown device',
    ipAddress: req.ip || req.socket.remoteAddress || 'Unknown',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt,
  });
  await user.save();
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, rememberMe = false } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      preferences: { theme: 'system', language: 'en', timezone: 'UTC' },
    });

    const refreshToken = getRefreshToken(user._id.toString());
    await appendSession(user, refreshToken, req);

    res.status(201).json({
      accessToken: getAccessToken(user._id.toString()),
      refreshToken,
      user: buildUserPayload(user),
      rememberMe,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid user data' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const refreshToken = getRefreshToken(user._id.toString());
    await appendSession(user, refreshToken, req);

    res.json({
      accessToken: getAccessToken(user._id.toString()),
      refreshToken,
      user: buildUserPayload(user),
      rememberMe,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'tamad-refresh-secret';
    const decoded = jwt.verify(refreshToken, secret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Session is invalid' });
    }

    const tokenHash = hashToken(refreshToken);
    const session = user.sessions?.find((entry: any) => entry.tokenHash === tokenHash && (!entry.revokedAt || entry.revokedAt > new Date()) && entry.expiresAt > new Date());

    if (!session) {
      return res.status(401).json({ error: 'Session is invalid' });
    }

    session.lastUsedAt = new Date();
    await user.save();

    res.json({ accessToken: getAccessToken(user._id.toString()), refreshToken, user: buildUserPayload(user) });
  } catch (error) {
    res.status(401).json({ error: 'Session is invalid' });
  }
};

export const logout = async (req: any, res: Response) => {
  try {
    const { refreshToken, allDevices = false } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (allDevices) {
      user.sessions = [];
    } else if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      user.sessions = (user.sessions || []).filter((entry: any) => entry.tokenHash !== tokenHash);
    } else {
      user.sessions = [];
    }

    await user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists, password reset instructions have been prepared.' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendMail(user.email, 'Reset your TaMaD password', `<p>Hello ${user.name},</p><p>Use the link below to reset your password:</p><p><a href="${resetLink}">Reset password</a></p>`);

    res.json({ message: 'If an account exists, password reset instructions have been prepared.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to process password reset' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Reset token and password are required' });
    }

    const user = await User.findOne({ passwordResetTokenHash: hashToken(token) }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Reset token is invalid or expired' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to reset password' });
  }
};

export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  res.json({ user: buildUserPayload(user) });
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, avatarUrl, preferences } = req.body;
    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json({ user: buildUserPayload(user) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to update profile' });
  }
};

export const getSessions = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  res.json({ sessions: user?.sessions || [] });
};
