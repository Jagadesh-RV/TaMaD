import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string; // Markdown or HTML content
  folderId?: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  isArchived: boolean;
}

const DocumentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);
DocumentSchema.index({ title: 'text', content: 'text' });

export default mongoose.model<IDocument>('Document', DocumentSchema);
