import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  firebaseUid: string;
  phoneNumber?: string;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'phone';
  emailVerified: boolean;
  phoneVerified: boolean;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin: Date;
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
  }>;
}

const SessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    deviceName: { type: String, default: 'Unknown device' },
    ipAddress: { type: String, default: 'Unknown' },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    authProvider: { type: String, enum: ['google', 'email', 'phone'], required: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
    },
    sessions: [SessionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
