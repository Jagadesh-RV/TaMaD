import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  googleId?: string;
  githubId?: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  sessions: Array<{
    tokenHash: string;
    deviceName: string;
    ipAddress: string;
    createdAt: Date;
    lastUsedAt: Date;
    expiresAt: Date;
    revokedAt?: Date;
  }>;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const SessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    deviceName: { type: String, default: 'Unknown device' },
    ipAddress: { type: String, default: 'Unknown' },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatarUrl: { type: String },
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
    },
    sessions: [SessionSchema],
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err: any) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.hashToken = function (token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default mongoose.model<IUser>('User', UserSchema);
