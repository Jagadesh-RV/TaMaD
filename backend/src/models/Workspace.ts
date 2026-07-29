import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  type: 'personal' | 'team';
  ownerId: mongoose.Types.ObjectId;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'guest' | 'manager' | 'developer' | 'designer' | 'qa' | 'product_owner';
  }>;
  isActive: boolean;
  settings: {
    allowGuests: boolean;
    isPublic: boolean;
  };
}

const WorkspaceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['personal', 'team'], default: 'team' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { 
          type: String, 
          enum: ['owner', 'admin', 'member', 'guest', 'manager', 'developer', 'designer', 'qa', 'product_owner'], 
          default: 'member' 
        },
      },
    ],
    isActive: { type: Boolean, default: true },
    settings: {
      allowGuests: { type: Boolean, default: false },
      isPublic: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
