import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  teamId: string;
  hostId: string;
  roomName: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  startTime: string;
  duration?: number;
  meetingType: string;
  aiSummary?: string;
}

interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  loading: boolean;
  activeToken: string | null;
  activeRoomName: string | null;
  
  fetchMeetings: (teamId?: string) => Promise<void>;
  createMeeting: (payload: any) => Promise<Meeting>;
  joinMeeting: (id: string) => Promise<{ token: string, roomName: string }>;
  endMeeting: (id: string) => Promise<void>;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  clearActiveMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  currentMeeting: null,
  loading: false,
  activeToken: null,
  activeRoomName: null,

  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  
  clearActiveMeeting: () => set({ activeToken: null, activeRoomName: null, currentMeeting: null }),

  fetchMeetings: async (teamId?: string) => {
    set({ loading: true });
    try {
      const url = teamId ? `/meetings?teamId=${teamId}` : '/meetings';
      const { data } = await api.get(url);
      set({ meetings: data.meetings, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load meetings');
    }
  },

  createMeeting: async (payload) => {
    try {
      const { data } = await api.post('/meetings', payload);
      set((s) => ({ meetings: [data.meeting, ...s.meetings] }));
      toast.success('Meeting scheduled successfully');
      return data.meeting;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to schedule meeting';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  joinMeeting: async (id) => {
    try {
      const { data } = await api.post(`/meetings/${id}/join`);
      set({ activeToken: data.token, activeRoomName: data.roomName, currentMeeting: data.meeting });
      return { token: data.token, roomName: data.roomName };
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join meeting');
      throw new Error('Failed to join meeting');
    }
  },

  endMeeting: async (id) => {
    try {
      await api.post(`/meetings/${id}/end`);
      set((s) => ({
        meetings: s.meetings.map(m => (m._id === id ? { ...m, status: 'ended' } : m)),
        activeToken: null,
        activeRoomName: null
      }));
      toast.success('Meeting ended');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to end meeting');
    }
  }
}));
