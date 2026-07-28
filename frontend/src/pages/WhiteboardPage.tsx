import { useState, useRef, useEffect } from 'react';
import { Pen, Square, Circle, Eraser, MousePointer2, Plus, Users, Share2, ChevronDown } from 'lucide-react';
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
    <div className="page flex flex-col h-[calc(100vh-80px)] p-0 bg-white rounded-3xl border border-border shadow-sm overflow-hidden relative z-10">
      
      {/* Header Toolbar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Board Title & Selector */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-3 pointer-events-auto shadow-sm border border-border">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Pen size={18} />
          </div>
          <div className="relative flex flex-col">
            <div className="flex items-center">
              <select 
                 className="bg-transparent outline-none appearance-none cursor-pointer text-sm font-bold text-gray-900 tracking-wide pr-6 z-10"
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
               <ChevronDown size={14} className="absolute right-0 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Auto-saved</p>
          </div>
        </div>

        {/* Tools Palette */}
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1 pointer-events-auto shadow-sm border border-border">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id as any)}
              className={clsx(
                'p-3 rounded-xl transition-all duration-200',
                activeTool === t.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
              )}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Collab / Share */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center -space-x-3 mr-1">
            <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center text-xs font-bold z-20 shadow-sm">J</div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-amber-500 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">A</div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"><Plus size={14}/></div>
          </div>
          <button className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-border">
            <Share2 size={18} />
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
        className="flex-1 w-full h-full bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {!activeBoard ? (
          <div className="w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-6 py-3 shadow-lg"
            >
              + Create Whiteboard
            </button>
          </div>
        ) : (
          <svg className="w-full h-full pointer-events-none">
            {activeBoard?.elements?.map((el: any, i: number) => (
              <path
                key={i}
                d={el.data}
                fill="none"
                stroke="#0071e3"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {isDrawing && currentPath && (
              <path
                d={currentPath}
                fill="none"
                stroke="#0071e3"
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
  );
}
