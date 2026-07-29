import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHabitStore } from '../../store/habitStore';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import api from '../../utils/api';
import toast from 'react-hot-toast';

const mockedApi = vi.mocked(api);
const mockedToast = vi.mocked(toast);

describe('Habit Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHabitStore.setState({
      habits: [],
      loading: false,
      error: null,
    });
  });

  describe('fetchHabits', () => {
    it('fetches habits successfully', async () => {
      const mockHabits = [
        { _id: '1', name: 'Exercise', frequency: 'daily', completions: [] },
        { _id: '2', name: 'Reading', frequency: 'daily', completions: [] },
      ];
      mockedApi.get.mockResolvedValue({ data: mockHabits });

      await useHabitStore.getState().fetchHabits('ws1');

      expect(useHabitStore.getState().habits).toEqual(mockHabits);
      expect(useHabitStore.getState().loading).toBe(false);
    });

    it('handles fetch error', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));

      await useHabitStore.getState().fetchHabits('ws1');

      expect(useHabitStore.getState().error).toBeTruthy();
      expect(mockedToast.error).toHaveBeenCalled();
    });
  });

  describe('createHabit', () => {
    it('creates a habit successfully', async () => {
      const mockHabit = { _id: '1', title: 'New Habit', frequency: 'daily', completions: [] };
      mockedApi.post.mockResolvedValue({ data: mockHabit });

      await useHabitStore.getState().createHabit({
        title: 'New Habit',
        frequency: 'daily',
        workspaceId: 'ws1',
      });

      expect(useHabitStore.getState().habits).toContainEqual(mockHabit);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });

  describe('deleteHabit', () => {
    it('deletes a habit successfully', async () => {
      useHabitStore.setState({
        habits: [{ _id: '1', title: 'Habit 1', frequency: 'daily', completions: [] }] as any,
      });
      mockedApi.delete.mockResolvedValue({});

      await useHabitStore.getState().deleteHabit('1');

      expect(useHabitStore.getState().habits).toHaveLength(0);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });
});
