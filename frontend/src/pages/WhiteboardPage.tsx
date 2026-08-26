import { useState, useEffect } from 'react';
import { Plus, Share2, ChevronDown } from 'lucide-react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import { useAuthStore } from '../store/authStore';
import WhiteboardModal from '../components/whiteboards/WhiteboardModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function WhiteboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<any>(null);

  const { whiteboards, fetchWhiteboards, createWhiteboard, loading } = useWhiteboardStore() as any;
  const workspace = useAuthStore(s => s.workspace);

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) fetchWhiteboards(workspaceId);
  }, [fetchWhiteboards, workspaceId]);

  useEffect(() => {
    if (!activeBoard && whiteboards?.length > 0) {
      setActiveBoard(whiteboards[0]);
    }
  }, [whiteboards, activeBoard]);

  const handleSaveBoard = async (data: any) => {
    const newBoard = await createWhiteboard({ ...data, workspaceId });
    if (newBoard) {
      setActiveBoard(newBoard);
    }
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-64px)] p-4 lg:p-6 bg-[color:var(--color-background)] relative z-10">
      <div className="flex-1 rounded-[24px] border border-[color:var(--color-border)] shadow-sm overflow-hidden relative bg-[color:var(--color-surface)] flex flex-col">
        
        {/* Header Toolbar (Standard block, no overlap) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:px-6 bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] z-20 shrink-0">
          
          {/* Board Title & Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--color-accent-ghost)] flex items-center justify-center shrink-0" style={{ color: 'var(--color-accent)' }}>
              <div className="w-5 h-5 rounded-full border-2 border-current opacity-80" />
            </div>
            <div className="relative flex flex-col min-w-[150px]">
              <div className="flex items-center">
                <select 
                   className="bg-transparent outline-none appearance-none cursor-pointer text-sm font-bold tracking-wide pr-6 z-10 w-full text-ellipsis"
                   style={{ color: 'var(--color-foreground)' }}
                   value={activeBoard?._id || ''}
                   onChange={(e) => {
                     if (e.target.value === 'new') setIsModalOpen(true);
                     else setActiveBoard(whiteboards.find((w: any) => w._id === e.target.value));
                   }}
                 >
                   {whiteboards.length === 0 && <option value="" disabled>No boards</option>}
                   {whiteboards.map((w: any) => <option key={w._id} value={w._id}>{w.title}</option>)}
                   <option value="new">+ Create New Board</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-0 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
              </div>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>Live Sync</p>
            </div>
          </div>

          {/* Collab / Share */}
          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="flex items-center -space-x-3 mr-1">
              <div className="w-9 h-9 rounded-full border-[2px] border-[color:var(--color-surface)] bg-[color:var(--color-info)] text-white flex items-center justify-center text-[11px] font-bold z-20 shadow-sm">J</div>
              <div className="w-9 h-9 rounded-full border-[2px] border-[color:var(--color-surface)] bg-[color:var(--color-warning)] text-white flex items-center justify-center text-[11px] font-bold z-10 shadow-sm">A</div>
              <div className="w-9 h-9 rounded-full border-[2px] border-[color:var(--color-surface)] bg-[color:var(--color-surface-active)] flex items-center justify-center text-[11px] font-bold hover:bg-[color:var(--color-surface-hover)] transition-colors cursor-pointer shadow-sm" style={{ color: 'var(--color-foreground-secondary)' }}><Plus size={14}/></div>
            </div>
            <button className="p-2.5 rounded-xl hover:bg-[color:var(--color-surface-hover)] transition-colors group" style={{ color: 'var(--color-foreground-secondary)' }}>
              <Share2 size={18} className="group-hover:text-[color:var(--color-accent)] transition-colors" />
            </button>
          </div>
        </div>

        {/* Tldraw Canvas Area */}
        {loading ? (
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <LoadingSpinner text="Loading whiteboards..." />
          </div>
        ) : (
          <div className="flex-1 w-full h-full relative" style={{ isolation: 'isolate' }}>
            {!activeBoard ? (
              <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-surface)]">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary px-8 py-3.5 shadow-float rounded-xl text-[14px] pointer-events-auto"
                >
                  <Plus size={18} className="mr-2" />
                  Create Whiteboard
                </button>
              </div>
            ) : (
              <div className="w-full h-full" style={{ '--color-background': 'var(--color-surface)' } as any}>
                <Tldraw persistenceKey={`tamad-board-${activeBoard._id}`} />
              </div>
            )}
          </div>
        )}

        <WhiteboardModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBoard}
        />
      </div>
    </div>
  );
}
