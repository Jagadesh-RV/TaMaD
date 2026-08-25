import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { createEngineMeeting, getMeetingsByTeam, getMeetingDetails } from '../../services/tamad-meet/meetingEngineService';
import { verifyRoomAccess } from '../../services/tamad-meet/meetingRoomService';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await createEngineMeeting(req.body, req.user!._id);
    res.status(201).json({ meeting });
  } catch (_error) {
    res.status(500).json({ error: error.message || 'Failed to create TaMaD Meet meeting' });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'Team ID is required' });
    
    const meetings = await getMeetingsByTeam(teamId as string);
    res.json({ meetings });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const getMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await getMeetingDetails(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ meeting });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { room, participant } = await verifyRoomAccess(roomId, req.user!._id);
    res.json({ room, participant });
  } catch (_error) {
    res.status(403).json({ error: error.message || 'Failed to join room' });
  }
};
