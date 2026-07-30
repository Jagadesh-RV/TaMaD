import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk';
import Meeting from '../models/Meeting';
import mongoose from 'mongoose';

const livekitHost = process.env.LIVEKIT_URL || 'wss://tamad-hmidu7j9.livekit.cloud';
const apiKey = process.env.LIVEKIT_API_KEY || 'APIhxkkAHyCN7hq';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'CbSIf6Ok92SXuyQEPN0iSZWgMPtRRMrNA8peYDl0wAZ';

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export const createMeetingRoom = async (roomName: string, meetingId: string) => {
  const room = await roomService.createRoom({
    name: roomName,
    emptyTimeout: 10 * 60, // 10 minutes
    metadata: JSON.stringify({ meetingId }),
  });
  return room;
};

export const generateParticipantToken = (roomName: string, participantName: string, participantId: string, role: string) => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
  });

  const canPublish = role === 'host' || role === 'participant' || role === 'moderator';
  const canPublishData = role === 'host' || role === 'moderator';
  
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData,
  });

  return at.toJwt();
};

export const listRooms = async () => {
  return await roomService.listRooms();
};

export const deleteRoom = async (roomName: string) => {
  return await roomService.deleteRoom(roomName);
};

export const removeParticipant = async (roomName: string, identity: string) => {
  return await roomService.removeParticipant(roomName, identity);
};
