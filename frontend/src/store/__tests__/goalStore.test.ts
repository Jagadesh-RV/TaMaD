import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGoalStore } from '../../store/goalStore';

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

describe('Goal Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGoalStore.setState({
      goals: [],
      loading: false,
      error: null,
    });
  });

  describe('fetchGoals', () => {
    it('fetches goals successfully', async () => {
      const mockGoals = [
        { _id: '1', title: 'Goal 1', progress: 50, milestones: [] },
        { _id: '2', title: 'Goal 2', progress: 0, milestones: [] },
      ];
      mockedApi.get.mockResolvedValue({ data: mockGoals });

      await useGoalStore.getState().fetchGoals('ws1');

      expect(useGoalStore.getState().goals).toEqual(mockGoals);
      expect(useGoalStore.getState().loading).toBe(false);
    });

    it('handles fetch error', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));

      await useGoalStore.getState().fetchGoals('ws1');

      expect(useGoalStore.getState().error).toBeTruthy();
      expect(mockedToast.error).toHaveBeenCalled();
    });
  });

  describe('createGoal', () => {
    it('creates a goal successfully', async () => {
      const mockGoal = { _id: '1', title: 'New Goal', progress: 0, milestones: [] };
      mockedApi.post.mockResolvedValue({ data: mockGoal });

      await useGoalStore.getState().createGoal({
        title: 'New Goal',
        workspaceId: 'ws1',
      });

      expect(useGoalStore.getState().goals).toContainEqual(mockGoal);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });

  describe('deleteGoal', () => {
    it('deletes a goal successfully', async () => {
      useGoalStore.setState({
        goals: [{ _id: '1', title: 'Goal 1', progress: 0, milestones: [] }],
      });
      mockedApi.delete.mockResolvedValue({});

      await useGoalStore.getState().deleteGoal('1');

      expect(useGoalStore.getState().goals).toHaveLength(0);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });
});
