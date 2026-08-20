import { useState, useRef, useEffect } from 'react';
import { Pen, Square, Circle, Eraser, MousePointer2, Plus, Share2, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useWhiteboardStore } from '../store/whiteboardStore';
import { useAuthStore } from '../store/authStore';
import WhiteboardModal from '../components/whiteboards/WhiteboardModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function WhiteboardPage() {
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'square' | 'circle' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<any>(null);

  const { whiteboards, fetchWhiteboards, createWhiteboard, updateWhiteboard, loading } = useWhiteboardStore() as any;
  const workspace = useAuthStore(s => s.workspace);
  const canvasRef = useRef<HTMLDivElement>(null);

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) fetchWhiteboards(workspaceId);
  }, [fetchWhiteboards, workspaceId]);

  useEffect(() => {
    if (!activeBoard && whiteboards?.length > 0) {
      setActiveBoard(whiteboards[0]);
    }
  }, [whiteboards, activeBoard]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'pen' || !activeBoard) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath(`M ${x} ${y}`);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || activeTool !== 'pen' || !activeBoard) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath((prev) => `${prev} L ${x} ${y}`);
  };

  const handlePointerUp = () => {
    if (!isDrawing || !activeBoard) return;
    setIsDrawing(false);
    if (currentPath) {
      const newElements = [...(activeBoard.elements || []), { type: 'path', data: currentPath }];
      const updatedBoard = { ...activeBoard, elements: newElements };
      setActiveBoard(updatedBoard);
      setCurrentPath('');
      updateWhiteboard(activeBoard._id, { elements: newElements });
    }
  };

  const handleSaveBoard = async (data: any) => {
    const newBoard = await createWhiteboard({ ...data, workspaceId });
    if (newBoard) {
      setActiveBoard(newBoard);
    }
  };

  const tools = [
    { id: 'select', icon: <MousePointer2 size={18} /> },
    { id: 'pen', icon: <Pen size={18} /> },
    { id: 'square', icon: <Square size={18} /> },
    { id: 'circle', icon: <Circle size={18} /> },
    { id: 'eraser', icon: <Eraser size={18} /> },
  ];

  return (
    <div className="page flex flex-col h-[calc(100vh-64px)] p-4 lg:p-6 bg-[color:var(--color-background)] relative z-10">
      <div className="flex-1 rounded-[24px] border border-border shadow-sm overflow-hidden relative bg-[color:var(--color-surface)] flex flex-col">
        
        {/* Header Toolbar */}
        <div className="absolute top-6 left-6 right-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
          
          {/* Board Title & Selector */}
          <div className="bg-[color:var(--color-surface)]/90 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 pointer-events-auto shadow-float border border-border">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--color-accent-ghost)] flex items-center justify-center shrink-0" style={{ color: 'var(--color-accent)' }}>
              <Pen size={18} />
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
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>Auto-saved</p>
            </div>
          </div>

          {/* Tools Palette */}
          <div className="bg-[color:var(--color-surface)]/90 backdrop-blur-md p-2 rounded-2xl flex items-center gap-1.5 pointer-events-auto shadow-float border border-border">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id as any)}
                className={clsx(
                  'p-3 rounded-xl transition-all duration-200',
                  activeTool === t.id
                    ? 'bg-[color:var(--color-accent-ghost)]'
                    : 'hover:bg-[color:var(--color-surface-hover)] border border-transparent'
                )}
                style={{ 
                  color: activeTool === t.id ? 'var(--color-accent)' : 'var(--color-foreground-secondary)'
                }}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Collab / Share */}
          <div className="flex items-center gap-3 pointer-events-auto hidden sm:flex">
            <div className="flex items-center -space-x-3 mr-1">
              <div className="w-10 h-10 rounded-full border-[2.5px] border-[color:var(--color-surface)] bg-[color:var(--color-info)] text-white flex items-center justify-center text-xs font-bold z-20 shadow-sm">J</div>
              <div className="w-10 h-10 rounded-full border-[2.5px] border-[color:var(--color-surface)] bg-[color:var(--color-warning)] text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">A</div>
              <div className="w-10 h-10 rounded-full border-[2.5px] border-[color:var(--color-surface)] bg-[color:var(--color-surface-active)] flex items-center justify-center text-xs font-bold hover:bg-[color:var(--color-surface-hover)] transition-colors cursor-pointer" style={{ color: 'var(--color-foreground-secondary)' }}><Plus size={14}/></div>
            </div>
            <button className="bg-[color:var(--color-surface)]/90 backdrop-blur-md p-3 rounded-2xl hover:bg-[color:var(--color-accent-ghost)] transition-colors shadow-float border border-border group" style={{ color: 'var(--color-foreground-secondary)' }}>
              <Share2 size={18} className="group-hover:text-[color:var(--color-accent)] transition-colors" />
            </button>
          </div>
        </div>

        {/* Infinite Canvas Area */}
        {loading ? (
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <LoadingSpinner text="Loading whiteboards..." />
          </div>
        ) : (
        <div
          ref={canvasRef}
          className="flex-1 w-full h-full cursor-crosshair touch-none"
          style={{
            background: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundColor: 'var(--color-surface)'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {!activeBoard ? (
            <div className="w-full h-full flex items-center justify-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary px-8 py-3.5 shadow-float rounded-xl text-[14px]"
              >
                <Plus size={18} className="mr-2" />
                Create Whiteboard
              </button>
            </div>
          ) : (
            <svg className="w-full h-full pointer-events-none">
              {activeBoard?.elements?.map((el: any, i: number) => (
                <path
                  key={i}
                  d={el.data}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {isDrawing && currentPath && (
                <path
                  d={currentPath}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
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
