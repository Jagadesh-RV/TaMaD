import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export interface TeamMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  roleId: {
    _id: string;
    name: string;
  };
  status: 'active' | 'suspended';
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  color: string;
  visibility: 'private' | 'public';
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeams: () => Promise<void>;
  getTeamById: (id: string) => Promise<void>;
  createTeam: (payload: Partial<Team>) => Promise<Team>;
  updateTeam: (id: string, payload: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  leaveTeam: (id: string) => Promise<void>;
  getMembers: (id: string) => Promise<void>;
  inviteMember: (id: string, email: string, roleId: string, inviteType: 'email' | 'link') => Promise<any>;
  joinTeam: (id: string, token: string) => Promise<void>;
  updateMemberRole: (id: string, memberId: string, roleId: string) => Promise<void>;
  removeMember: (id: string, memberId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  loading: false,
  error: null,

  setCurrentTeam: (team) => set({ currentTeam: team }),

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/teams');
      set({ teams: data.teams, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load teams');
    }
  },

  getTeamById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/teams/${id}`);
      set({ currentTeam: data.team, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load team');
    }
  },

  createTeam: async (payload) => {
    try {
      const { data } = await api.post('/teams', payload);
      set(s => ({ teams: [...s.teams, data.team] }));
      toast.success('Team created successfully');
      return data.team;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create team';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  updateTeam: async (id, payload) => {
    try {
      const { data } = await api.patch(`/teams/${id}`, payload);
      set(s => ({
        teams: s.teams.map(t => (t._id === id ? data.team : t)),
        currentTeam: s.currentTeam?._id === id ? data.team : s.currentTeam,
      }));
      toast.success('Team updated successfully');
      return data.team;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update team');
      throw new Error('Failed to update team');
    }
  },

  deleteTeam: async (id) => {
    try {
      await api.delete(`/teams/${id}`);
      set(s => ({ 
        teams: s.teams.filter(t => t._id !== id),
        currentTeam: s.currentTeam?._id === id ? null : s.currentTeam
      }));
      toast.success('Team deleted');
    } catch {
      toast.error('Failed to delete team');
    }
  },

  leaveTeam: async (id) => {
    try {
      await api.post(`/teams/${id}/leave`);
      set(s => ({ 
        teams: s.teams.filter(t => t._id !== id),
        currentTeam: s.currentTeam?._id === id ? null : s.currentTeam
      }));
      toast.success('You have left the team');
    } catch {
      toast.error('Failed to leave team');
    }
  },

  getMembers: async (id) => {
    try {
      const { data } = await api.get(`/teams/${id}/members`);
      set({ members: data.members });
    } catch {
      toast.error('Failed to fetch members');
    }
  },

  inviteMember: async (id, email, roleId, inviteType) => {
    try {
      const { data } = await api.post(`/teams/${id}/invite`, { email, roleId, inviteType });
      toast.success('Invitation generated');
      return data.invite;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to invite member');
      throw err;
    }
  },

  joinTeam: async (id, token) => {
    try {
      await api.post(`/teams/join`, { token });
      toast.success('Successfully joined team');
      await get().fetchTeams();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join team');
      throw err;
    }
  },

  updateMemberRole: async (id, memberId, roleId) => {
    try {
      const { data } = await api.patch(`/teams/${id}/members/${memberId}`, { roleId });
      set(s => ({
        members: s.members.map(m => (m.userId._id === memberId ? { ...m, roleId: data.member.roleId } : m))
      }));
      toast.success('Member role updated');
    } catch {
      toast.error('Failed to update member role');
    }
  },

  removeMember: async (id, memberId) => {
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      set(s => ({ members: s.members.filter(m => m.userId._id !== memberId) }));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  },

}));
