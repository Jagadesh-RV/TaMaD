// meetingSignalingService handles saving signaling logs to the DB if needed for audits.
import TamadMeetICECandidate from '../../models/tamad-meet/TamadMeetICECandidate';
import TamadMeetPeerConnection from '../../models/tamad-meet/TamadMeetPeerConnection';

export const logOffer = async (meetingId: string, callerId: string, calleeId: string, offer: any) => {
  return await TamadMeetPeerConnection.create({
    meetingId,
    callerId,
    calleeId,
    status: 'connecting',
    sdpOffer: offer
  });
};

export const logAnswer = async (connectionId: string, answer: any) => {
  return await TamadMeetPeerConnection.findByIdAndUpdate(connectionId, {
    status: 'connected',
    sdpAnswer: answer
  });
};

export const logICECandidate = async (meetingId: string, senderId: string, receiverId: string, candidate: any) => {
  return await TamadMeetICECandidate.create({
    meetingId,
    senderId,
    receiverId,
    candidate
  });
};
