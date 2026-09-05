import mongoose, { Document, Schema } from 'mongoose';

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string; // Since they might not use Firebase for super admin login, or we can use it. Let's use passwordHash for isolated admin accounts.
  isActive: boolean;
  role: 'superadmin' | 'read-only-admin';
  lastLogin?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['superadmin', 'read-only-admin'], default: 'superadmin' },
    lastLogin: { type: Date },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
