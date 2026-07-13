import { useState } from 'react';
import { Plus, Flag, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import clsx from 'clsx';
import { format, addDays, startOfMonth, eachDayOfInterval } from 'date-fns';

const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Q3 Marketing Site Redesign',
    color: 'bg-blue-500',
    startDate: new Date(),
    endDate: addDays(new Date(), 14),
    progress: 45,
    milestones: [
      { id: 'm1', name: 'Design Handoff', date: addDays(new Date(), 5) },
      { id: 'm2', name: 'Frontend Launch', date: addDays(new Date(), 12) },
    ],
  },
  {
    id: 'p2',
    name: 'AI Model Integration',
    color: 'bg-purple-500',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 20),
    progress: 15,
    milestones: [
      { id: 'm3', name: 'API Docs', date: addDays(new Date(), 8) },
    ],
  },
];

export default function RoadmapPage() {
  const [currentDate] = useState(new Date());
  
  // Generate a timeline spanning 30 days from start of month
  const timelineStart = startOfMonth(currentDate);
  const timelineEnd = addDays(timelineStart, 30);
  const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });

  const getLeftOffset = (date: Date) => {
    const diffTime = Math.abs(date.getTime() - timelineStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * (100 / 30); // percentage
  };

  const getWidth = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * (100 / 30); // percentage
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="page-title mb-0">Roadmap</h1>
          <p className="text-secondary mt-1 text-sm">Visualize project timelines and milestones.</p>
        </div>

        <button className="btn-primary flex items-center justify-center gap-2 px-4 py-2 w-auto">
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b border-gray-200 bg-gray-50/80">
          <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-semibold text-gray-700 flex items-center gap-2">
            <AlignLeft size={18} className="text-gray-400" />
            Projects
          </div>
          <div className="flex-1 flex overflow-hidden relative">
            {days.map((day, i) => (
              <div
                key={i}
                className="flex-1 border-r border-gray-200/50 py-2 text-center text-xs font-medium text-gray-400 flex flex-col items-center justify-center"
              >
                <span>{format(day, 'MMM')}</span>
                <span className="text-gray-700 font-bold">{format(day, 'dd')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto">
          {MOCK_PROJECTS.map((project) => (
            <div key={project.id} className="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors">
              {/* Project Info Sidebar */}
              <div className="w-64 shrink-0 border-r border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{project.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarIcon size={12} />
                  <span>{format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d')}</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full transition-all', project.color)} style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Gantt Area */}
              <div className="flex-1 relative py-4">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex">
                  {days.map((_, i) => (
                    <div key={i} className="flex-1 border-r border-gray-100/50 h-full pointer-events-none" />
                  ))}
                </div>

                {/* Project Bar */}
                <div
                  className={clsx('absolute top-6 h-8 rounded-lg shadow-sm opacity-90 transition-transform hover:scale-[1.01] cursor-pointer flex items-center px-3', project.color)}
                  style={{
                    left: `${getLeftOffset(project.startDate)}%`,
                    width: `${getWidth(project.startDate, project.endDate)}%`,
                  }}
                >
                  <span className="text-white text-xs font-medium truncate">{project.name}</span>
                </div>

                {/* Milestones */}
                {project.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="absolute top-3 w-6 h-6 flex items-center justify-center cursor-pointer group/ms"
                    style={{ left: `calc(${getLeftOffset(ms.date)}% - 12px)` }}
                  >
                    <div className="w-3 h-3 rotate-45 bg-amber-400 border-2 border-white shadow-sm transition-transform group-hover/ms:scale-125" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/ms:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {ms.name} - {format(ms.date, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}