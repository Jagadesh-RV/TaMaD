import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import clsx from 'clsx';
import { format, addDays, startOfMonth, eachDayOfInterval } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import ProjectModal from '../components/projects/ProjectModal';
import EmptyState from '../components/ui/EmptyState';

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500'];

export default function RoadmapPage() {
  const workspace = useAuthStore(s => s.workspace);
  const { projects, fetchProjects, createProject } = useProjectStore() as any;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate] = useState(new Date());

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) fetchProjects(workspaceId);
  }, [fetchProjects, workspaceId]);
  
  // Generate a timeline spanning 30 days from start of month
  const timelineStart = startOfMonth(currentDate);
  const timelineEnd = addDays(timelineStart, 30);
  const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });

  const getLeftOffset = (dateStr: string) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const diffTime = date.getTime() - timelineStart.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return Math.min(100, diffDays * (100 / 30)); // percentage
  };

  const getWidth = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 10;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return Math.min(100, diffDays * (100 / 30)); // percentage
  };

  const handleSaveProject = async (data: any) => {
    await createProject({
      ...data,
      workspaceId: '000000000000000000000000'
    });
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="page-title mb-0">Roadmap</h1>
          <p className="text-secondary mt-1 text-sm font-medium">Visualize project timelines and milestones.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2 w-auto"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative z-0">
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
          {projects.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No projects on the roadmap"
              description="A roadmap turns scattered work into a timeline. Lay your first project on the map and watch the quarter take shape."
              steps={[
                'Click New Project to create your first milestone',
                'Set a start and end date — the bar appears instantly',
                'Drag and build your timeline as projects grow',
              ]}
              action={{ label: 'New Project', onClick: () => setIsModalOpen(true) }}
            />
          ) : (
            projects.map((project: any, index: number) => {
              const color = COLORS[index % COLORS.length];
              return (
                <div key={project._id} className="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors h-24">
                  {/* Project Info Sidebar */}
                  <div className="w-64 shrink-0 border-r border-gray-200 p-4 overflow-hidden flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{project.name}</h3>
                    {project.startDate && project.endDate && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarIcon size={12} />
                        <span>{format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d')}</span>
                      </div>
                    )}
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
                    {project.startDate && project.endDate && (
                      <div
                        className={clsx('absolute top-6 h-8 rounded-lg shadow-sm opacity-90 transition-transform hover:scale-[1.01] cursor-pointer flex items-center px-3', color)}
                        style={{
                          left: `${getLeftOffset(project.startDate)}%`,
                          width: `${getWidth(project.startDate, project.endDate)}%`,
                        }}
                      >
                        <span className="text-white text-xs font-medium truncate">{project.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
}