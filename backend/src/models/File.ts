import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  storagePath: string;
  workspaceId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  noteId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  folder: string;
  isArchived: boolean;
}

const FileSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    storagePath: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    noteId: { type: Schema.Types.ObjectId, ref: 'Note' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    folder: { type: String, default: '/' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FileSchema.index({ workspaceId: 1, createdAt: -1 });
FileSchema.index({ workspaceId: 1, originalName: 'text' });

export default mongoose.model<IFile>('File', FileSchema);
