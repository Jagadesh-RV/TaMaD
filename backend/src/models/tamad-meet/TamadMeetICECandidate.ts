import mongoose, { Schema, Document } from 'mongoose';

export interface ITamadMeetICECandidate extends Document {
  meetingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  candidate: any;
}

const TamadMeetICECandidateSchema = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'TamadMeetMeeting', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  candidate: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

export default mongoose.models.TamadMeetICECandidate || mongoose.model<ITamadMeetICECandidate>('TamadMeetICECandidate', TamadMeetICECandidateSchema);
