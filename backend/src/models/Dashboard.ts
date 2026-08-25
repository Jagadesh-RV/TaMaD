import mongoose, { Schema, Document } from 'mongoose';

export interface IDashboardWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
}

export interface IDashboard extends Document {
  name: string;
  workspaceId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  layout: IDashboardWidget[];
  createdBy: mongoose.Types.ObjectId;
}

const DashboardWidgetSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed },
}, { _id: false });

const DashboardSchema: Schema = new Schema(
  {
    name: { type: String, required: true, default: 'Team Dashboard' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    isDefault: { type: Boolean, default: false },
    layout: [DashboardWidgetSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DashboardSchema.index({ workspaceId: 1, isDefault: 1 });
DashboardSchema.index({ teamId: 1 });

export default mongoose.model<IDashboard>('Dashboard', DashboardSchema);
