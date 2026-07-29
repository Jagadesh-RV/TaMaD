import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  teamId?: mongoose.Types.ObjectId; // If null, it's a global/system role
  isDefault: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    isDefault: { type: Boolean, default: false },
    description: { type: String },
  },
  { timestamps: true }
);

RoleSchema.index({ teamId: 1, name: 1 }, { unique: true });

export default mongoose.model<IRole>('Role', RoleSchema);
