import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
}

const PortfolioSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
