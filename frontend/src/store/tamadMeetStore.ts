import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export interface TamadMeetRoom {
  meetingId: string;
  roomId: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
}

export interface TamadMeetParticipant {
  _id: string;
  userId: string;
  role: string;
  status: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

interface TamadMeetState {
  meetings: any[];
  currentRoom: TamadMeetRoom | null;
  currentParticipant: TamadMeetParticipant | null;
  participants: Record<string, TamadMeetParticipant>;
  loading: boolean;
  token: string | null;
  
  fetchMeetings: (teamId: string) => Promise<void>;
  createMeeting: (payload: any) => Promise<any>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  updateParticipant: (participantId: string, updates: Partial<TamadMeetParticipant>) => void;
}

export const useTamadMeetStore = create<TamadMeetState>((set, get) => ({
  meetings: [],
  currentRoom: null,
  currentParticipant: null,
  participants: {},
  loading: false,
  token: null,

  fetchMeetings: async (teamId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/tamad-meet?teamId=${teamId}`);
      set({ meetings: data.meetings, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load TaMaD Meet meetings');
    }
  },

  createMeeting: async (payload) => {
    try {
      const { data } = await api.post('/tamad-meet', payload);
      set((s) => ({ meetings: [data.meeting, ...s.meetings] }));
      toast.success('Meeting scheduled successfully');
      return data.meeting;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to schedule meeting');
      throw err;
    }
  },

  joinRoom: async (roomId) => {
    try {
      const { data } = await api.post(`/tamad-meet/room/${roomId}/join`);
      set({ currentRoom: data.room, currentParticipant: data.participant, token: data.token });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join room');
      throw err;
    }
  },

  leaveRoom: () => {
    set({ currentRoom: null, currentParticipant: null, participants: {} });
  },

  updateParticipant: (participantId, updates) => {
    set((s) => ({
      participants: {
        ...s.participants,
        [participantId]: { ...s.participants[participantId], ...updates }
      }
    }));
  }
}));
