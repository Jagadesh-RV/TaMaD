import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface ParsedTask {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIState {
  parsedTask: ParsedTask | null;
  parsing: boolean;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  parseTask: (text: string) => Promise<ParsedTask | null>;
  clearParsedTask: () => void;
  sendChatMessage: (query: string, workspaceId: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  parsedTask: null,
  parsing: false,
  chatMessages: [],
  chatLoading: false,

  parseTask: async (text) => {
    set({ parsing: true });
    try {
      const { data } = await api.post('/ai/parse-task', { text });
      set({ parsedTask: data, parsing: false });
      return data;
    } catch {
      toast.error('Failed to parse task');
      set({ parsing: false });
      return null;
    }
  },

  clearParsedTask: () => set({ parsedTask: null }),

  sendChatMessage: async (query, workspaceId) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    set(s => ({ chatMessages: [...s.chatMessages, userMsg], chatLoading: true }));

    try {
      const { data } = await api.post('/ai/chat', { query, workspaceId });
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.message || data.response || 'I processed your request.',
        timestamp: new Date().toISOString(),
      };
      set(s => ({ chatMessages: [...s.chatMessages, assistantMsg], chatLoading: false }));
    } catch {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      set(s => ({ chatMessages: [...s.chatMessages, errorMsg], chatLoading: false }));
    }
  },

  clearChat: () => set({ chatMessages: [] }),
}));
