import mongoose, { Schema, Document } from 'mongoose';

export interface IWhiteboard extends Document {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any[]; // Array of drawing elements (lines, shapes, text)
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
}

const WhiteboardSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    elements: { type: Array, default: [] },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);
WhiteboardSchema.index({ title: 'text' });

export default mongoose.model<IWhiteboard>('Whiteboard', WhiteboardSchema);
