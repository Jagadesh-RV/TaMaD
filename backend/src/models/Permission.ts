import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  roleId: mongoose.Types.ObjectId;
  actions: string[]; // e.g., 'create:project', 'manage:team'
  resource?: string; // Optional scoping, e.g. 'Project'
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    actions: [{ type: String, required: true }],
    resource: { type: String },
  },
  { timestamps: true }
);

PermissionSchema.index({ roleId: 1 });

export default mongoose.model<IPermission>('Permission', PermissionSchema);
