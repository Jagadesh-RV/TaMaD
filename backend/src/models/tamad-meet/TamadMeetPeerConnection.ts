import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetPeerConnection extends Document {
  meetingId: mongoose.Types.ObjectId;
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  status: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdpOffer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdpAnswer?: any;
}

const TamadMeetPeerConnectionSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'TamadMeetMeeting', required: true },
  callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'], default: 'new' },
  sdpOffer: { type: Schema.Types.Mixed },
  sdpAnswer: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.TamadMeetPeerConnection || mongoose.model<ITamadMeetPeerConnection>('TamadMeetPeerConnection', TamadMeetPeerConnectionSchema);
