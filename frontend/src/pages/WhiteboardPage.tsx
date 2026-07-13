import { useState, useRef } from 'react';
import { Pen, Square, Circle, Eraser, MousePointer2, Plus, Users, Share2 } from 'lucide-react';
import clsx from 'clsx';

export default function WhiteboardPage() {
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'square' | 'circle' | 'eraser'>('pen');
  const [elements, setElements] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // A simple implementation of drawing paths in SVG
  const [currentPath, setCurrentPath] = useState<string>('');

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'pen') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath(`M ${x} ${y}`);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || activeTool !== 'pen') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath((prev) => `${prev} L ${x} ${y}`);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath) {
      setElements([...elements, { type: 'path', data: currentPath }]);
      setCurrentPath('');
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
        
        {/* Board Title */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-3 pointer-events-auto shadow-sm border border-border">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Pen size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-wide">Q3 Brainstorming</h2>
            <p className="text-[11px] text-gray-500 font-medium">Last edited 2 mins ago</p>
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
      <div
        ref={canvasRef}
        className="flex-1 w-full h-full bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg className="w-full h-full pointer-events-none">
          {elements.map((el, i) => (
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
      </div>
    </div>
  );
}
