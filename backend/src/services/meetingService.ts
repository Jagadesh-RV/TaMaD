import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

let cachedConfig: LiveKitConfig | null = null;

/**
 * LiveKit credentials are loaded exclusively from environment variables.
 * They are resolved lazily so the server can still boot (and surface a clear
 * error at the point of use) when the config is missing.
 */
export const getLiveKitConfig = (): LiveKitConfig => {
  if (cachedConfig) return cachedConfig;

  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      'LiveKit configuration is incomplete. Set LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.'
    );
  }

  cachedConfig = { url, apiKey, apiSecret };
  return cachedConfig;
};

export const getLiveKitServerUrl = (): string => getLiveKitConfig().url;

const getRoomService = () => {
  const { url, apiKey, apiSecret } = getLiveKitConfig();
  return new RoomServiceClient(url, apiKey, apiSecret);
};

export const createMeetingRoom = async (roomName: string, meetingId: string) => {
  const room = await getRoomService().createRoom({
    name: roomName,
    emptyTimeout: 10 * 60, // 10 minutes
    metadata: JSON.stringify({ meetingId }),
  });
  return room;
};

export const generateParticipantToken = async (roomName: string, participantName: string, participantId: string, role: string) => {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: 2 * 60 * 60, // 2 hours
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

  return await at.toJwt();
};

export const listRooms = async () => {
  return await getRoomService().listRooms();
};

export const deleteRoom = async (roomName: string) => {
  return await getRoomService().deleteRoom(roomName);
};

export const removeParticipant = async (roomName: string, identity: string) => {
  return await getRoomService().removeParticipant(roomName, identity);
};
