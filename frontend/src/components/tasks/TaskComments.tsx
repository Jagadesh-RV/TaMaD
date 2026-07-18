import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRealtime } from '../../providers/RealtimeProvider';
import { Send } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Comment {
  _id: string;
  content: string;
  userId: { _id: string; name: string; avatarUrl: string };
  createdAt: string;
}

export default function TaskComments({ taskId }: { taskId: string }) {
  const { user } = useAuthStore();
  const { socket } = useRealtime();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/tasks/${taskId}/comments`);
        setComments(data);
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();

    if (socket) {
      socket.on('comment_added', (comment: Comment) => {
        setComments(prev => [comment, ...prev]);
      });

      socket.on('comment_deleted', ({ commentId }) => {
        setComments(prev => prev.filter(c => c._id !== commentId));
      });
    }

    return () => {
      if (socket) {
        socket.off('comment_added');
        socket.off('comment_deleted');
      }
    };
  }, [taskId, socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      setNewComment('');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-[color:var(--color-muted)]">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-[color:var(--color-muted)]">No comments yet.</div>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="flex gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-[color:var(--color-surface-hover)]">
                {comment.userId.avatarUrl ? (
                  <img src={comment.userId.avatarUrl} alt={comment.userId.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-semibold text-[color:var(--color-muted)]">
                    {comment.userId.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-xl bg-[color:var(--color-surface)] border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[color:var(--color-foreground)]">{comment.userId.name}</span>
                  <span className="text-[10px] text-[color:var(--color-muted)]">
                    {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--color-foreground)]">{comment.content}</p>
                {user?._id === comment.userId._id && (
                  <button 
                    onClick={() => handleDelete(comment._id)}
                    className="mt-2 text-[10px] text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-[color:var(--color-surface)]">
        <div className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-xl border border-border bg-[color:var(--color-surface-hover)] py-2 pl-4 pr-10 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)] disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
