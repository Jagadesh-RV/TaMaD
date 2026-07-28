import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { useNoteStore } from '../noteStore';
import api from '../../utils/api';

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
  useNoteStore.setState({ notes: [], loading: false, error: null });
});

describe('noteStore', () => {
  it('has correct initial state', () => {
    const state = useNoteStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchNotes sets notes on success', async () => {
    const notes = [{ _id: '1', title: 'Test Note', content: 'body', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' }];
    mockApi.get.mockResolvedValue({ data: { notes } });

    await useNoteStore.getState().fetchNotes('w1');

    expect(useNoteStore.getState().notes).toEqual(notes);
    expect(useNoteStore.getState().loading).toBe(false);
  });

  it('fetchNotes sets error on failure', async () => {
    mockApi.get.mockRejectedValue(new Error('Failed'));

    await useNoteStore.getState().fetchNotes('w1');

    expect(useNoteStore.getState().notes).toEqual([]);
    expect(useNoteStore.getState().error).toBe('Failed');
  });

  it('fetchNotes skips when workspaceId is empty', async () => {
    await useNoteStore.getState().fetchNotes('');
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('createNote adds a note to state', async () => {
    const note = { _id: '2', title: 'New Note', content: '', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' };
    mockApi.post.mockResolvedValue({ data: note });

    const result = await useNoteStore.getState().createNote({ title: 'New Note', workspaceId: 'w1' });

    expect(result).toEqual(note);
    expect(useNoteStore.getState().notes).toContainEqual(note);
  });

  it('deleteNote removes a note from state', async () => {
    useNoteStore.setState({ notes: [{ _id: '1', title: 'N', content: '', workspaceId: 'w1', createdBy: 'u1', createdAt: '', updatedAt: '' }] });
    mockApi.delete.mockResolvedValue({});

    await useNoteStore.getState().deleteNote('1');

    expect(useNoteStore.getState().notes).toEqual([]);
  });
});
