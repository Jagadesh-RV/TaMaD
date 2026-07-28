import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDocumentStore } from '../../store/documentStore';

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

describe('Document Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDocumentStore.setState({
      documents: [],
      loading: false,
      error: null,
    });
  });

  describe('fetchDocuments', () => {
    it('fetches documents successfully', async () => {
      const mockDocuments = [
        { _id: '1', title: 'Doc 1', content: 'Content 1', workspaceId: 'ws1' },
        { _id: '2', title: 'Doc 2', content: 'Content 2', workspaceId: 'ws1' },
      ];
      mockedApi.get.mockResolvedValue({ data: mockDocuments });

      await useDocumentStore.getState().fetchDocuments('ws1');

      expect(useDocumentStore.getState().documents).toEqual(mockDocuments);
      expect(useDocumentStore.getState().loading).toBe(false);
    });

    it('handles fetch error', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));

      await useDocumentStore.getState().fetchDocuments('ws1');

      expect(useDocumentStore.getState().error).toBeTruthy();
      expect(mockedToast.error).toHaveBeenCalled();
    });
  });

  describe('createDocument', () => {
    it('creates a document successfully', async () => {
      const mockDocument = { _id: '1', title: 'New Doc', content: '', workspaceId: 'ws1' };
      mockedApi.post.mockResolvedValue({ data: mockDocument });

      await useDocumentStore.getState().createDocument({
        title: 'New Doc',
        workspaceId: 'ws1',
      });

      expect(useDocumentStore.getState().documents).toContainEqual(mockDocument);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('deletes a document successfully', async () => {
      useDocumentStore.setState({
        documents: [{ _id: '1', title: 'Doc 1', content: '', workspaceId: 'ws1' }],
      });
      mockedApi.delete.mockResolvedValue({});

      await useDocumentStore.getState().deleteDocument('1');

      expect(useDocumentStore.getState().documents).toHaveLength(0);
      expect(mockedToast.success).toHaveBeenCalled();
    });
  });
});
