import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Calendar,
  Users,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isPast, parseISO } from 'date-fns';
import clsx from 'clsx';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import ProjectModal from '../components/projects/ProjectModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ContextMenu } from '../components/ui/ContextMenu';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SkeletonGrid } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function ProjectsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  const { projects, fetchProjects, createProject, deleteProject, loading: projectsLoading, error: projectsError } = useProjectStore() as any;
  const { tasks, fetchTasks } = useTaskStore();
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';

  const isLoading = projectsLoading;
  const error = projectsError;

  const retry = useCallback(() => {
    if (workspaceId) {
      fetchProjects(workspaceId);
      fetchTasks(workspaceId);
    }
  }, [fetchProjects, fetchTasks, workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchProjects(workspaceId);
      fetchTasks(workspaceId);
    }
  }, [fetchProjects, fetchTasks, workspaceId]);

  const projectStats = useMemo(() => {
    const stats = new Map<string, { totalTasks: number; completedTasks: number; progress: number }>();
    for (const task of tasks as any[]) {
      const entry = stats.get(task.projectId) || { totalTasks: 0, completedTasks: 0, progress: 0 };
      entry.totalTasks += 1;
      if (task.status === 'done') entry.completedTasks += 1;
      stats.set(task.projectId, entry);
    }
    for (const entry of stats.values()) {
      entry.progress = entry.totalTasks > 0 ? Math.round((entry.completedTasks / entry.totalTasks) * 100) : 0;
    }
    return stats;
  }, [tasks]);

  const getProjectStats = (projectId: string) => projectStats.get(projectId) ?? { totalTasks: 0, completedTasks: 0, progress: 0 };

  const totalProjects = projects.length;
  const totalTasksAll = projects.reduce((sum: number, p: any) => sum + getProjectStats(p._id).totalTasks, 0);
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum: number, p: any) => sum + getProjectStats(p._id).progress, 0) / totalProjects)
    : 0;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'var(--color-success-light)', color: 'var(--color-success)' };
      case 'completed': return { bg: 'var(--color-info-light)', color: 'var(--color-info)' };
      case 'on-hold': return { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' };
      default: return { bg: 'var(--color-surface-active)', color: 'var(--color-muted)' };
    }
  };

  const handleSaveProject = async (data: any) => {
    await createProject({ ...data, workspaceId });
  };

  const handleDeleteClick = (id: string) => {
    const project = projects.find((p: any) => p._id === id);
    setProjectToDelete(project || null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete._id);
      setProjectToDelete(null);
    } catch {
      setProjectToDelete(null);
    }
  };

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      {/* Header */}
      <header className="mb-10 pt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between shrink-0">
        <div>
          <h1 className="text-[32px] font-display font-semibold tracking-tight text-[color:var(--color-foreground)] leading-none">
            Project HQ
          </h1>
          <p className="text-[15px] mt-2 text-[color:var(--color-foreground-secondary)]">
            Command central for all your active initiatives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary shadow-xs" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {[
          { label: 'Active Projects', value: totalProjects, icon: FolderKanban, color: 'var(--color-accent)' },
          { label: 'Tasks in flight', value: totalTasksAll, icon: Calendar, color: 'var(--color-info)' },
          { label: 'Global velocity', value: `${avgProgress}%`, icon: Users, color: 'var(--color-success)' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                 <p className="text-[13px] font-medium text-foreground-tertiary mb-1">{stat.label}</p>
                 <p className="text-[24px] font-display font-semibold text-foreground leading-none">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-active" style={{ color: stat.color }}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-10" style={{ scrollbarWidth: 'thin' }}>
        {isLoading && <SkeletonGrid count={4} />}
        {!isLoading && error && <ErrorState message={error} onRetry={retry} />}
        {!isLoading && !error && projects.length === 0 ? (
           <EmptyState
            icon={FolderKanban}
            title="HQ is quiet"
            description="Start your first project to organize your tasks."
            action={{ label: 'Launch Project', onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project: any, index: number) => {
               const stats = getProjectStats(project._id);
               const isOverdue = project.dueDate && (() => { try { return isPast(parseISO(project.dueDate)); } catch { return false; } })();
               return (
                 <motion.div key={project._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                   <ContextMenu items={[
                     { label: 'Edit Project', icon: <Edit2 size={14} />, onClick: () => { /* open edit */ } },
                     { label: 'Archive', icon: <Archive size={14} />, onClick: () => {} },
                     { divider: true, label: '' },
                     { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => handleDeleteClick(project._id), danger: true }
                   ]}>
                   <div className="group relative bg-surface border border-border rounded-3xl p-6 shadow-xs hover:shadow-soft hover:border-foreground-tertiary transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(project._id)}>
                     {/* Decorative top accent */}
                     <div className="absolute top-0 left-0 w-full h-1" style={{ background: project.color || 'var(--color-accent)' }} />
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[20px] font-bold shadow-sm" style={{ background: project.color || 'var(--color-accent)' }}>
                          {project.name?.charAt(0) || 'P'}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(project._id); }} className="w-8 h-8 rounded-full bg-surface-active text-muted hover:bg-danger-ghost hover:text-danger flex items-center justify-center transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>

                     <h3 className="text-[18px] font-display font-semibold text-foreground leading-tight mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
                     <p className="text-[13px] text-foreground-secondary line-clamp-2 min-h-[40px] mb-6">{project.description || 'No description provided.'}</p>

                     <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-[12px] font-medium text-foreground-tertiary">
                           <span>Progress</span>
                           <span style={{ color: project.color || 'var(--color-accent)' }}>{stats.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-active rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ background: project.color || 'var(--color-accent)' }} />
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-border-light">
                        <div className="flex items-center -space-x-2">
                           {project.members?.slice(0, 3).map((m: string, i: number) => (
                             <div key={i} className="w-7 h-7 rounded-full bg-surface-active border-2 border-surface flex items-center justify-center text-[10px] font-bold text-foreground">
                               {m.charAt(0).toUpperCase()}
                             </div>
                           ))}
                           {(project.members?.length || 0) > 3 && (
                             <div className="w-7 h-7 rounded-full bg-surface-active border-2 border-surface flex items-center justify-center text-[10px] font-bold text-foreground-tertiary">
                               +{(project.members.length - 3)}
                             </div>
                           )}
                           {(!project.members || project.members.length === 0) && (
                             <span className="text-[11px] text-muted font-medium">No members</span>
                           )}
                        </div>
                        {project.dueDate && (
                           <div className={clsx("flex items-center gap-1.5 text-[11px] font-bold", isOverdue ? "text-danger" : "text-muted")}>
                              <Calendar size={12} />
                   <div className="group relative bg-surface border border-border rounded-3xl p-6 shadow-xs hover:shadow-soft hover:border-foreground-tertiary transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(project._id)}>
                     {/* Decorative top accent */}
                     <div className="absolute top-0 left-0 w-full h-1" style={{ background: project.color || 'var(--color-accent)' }} />
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[20px] font-bold shadow-sm" style={{ background: project.color || 'var(--color-accent)' }}>
                          {project.name?.charAt(0) || 'P'}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(project._id); }} className="w-8 h-8 rounded-full bg-surface-active text-muted hover:bg-danger-ghost hover:text-danger flex items-center justify-center transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>

                     <h3 className="text-[18px] font-display font-semibold text-foreground leading-tight mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
                     <p className="text-[13px] text-foreground-secondary line-clamp-2 min-h-[40px] mb-6">{project.description || 'No description provided.'}</p>

                     <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-[12px] font-medium text-foreground-tertiary">
                           <span>Progress</span>
                           <span style={{ color: project.color || 'var(--color-accent)' }}>{stats.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-active rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ background: project.color || 'var(--color-accent)' }} />
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-border-light">
                        <div className="flex items-center -space-x-2">
                           {project.members?.slice(0, 3).map((m: string, i: number) => (
                             <div key={i} className="w-7 h-7 rounded-full bg-surface-active border-2 border-surface flex items-center justify-center text-[10px] font-bold text-foreground">
                               {m.charAt(0).toUpperCase()}
                             </div>
                           ))}
                           {(project.members?.length || 0) > 3 && (
                             <div className="w-7 h-7 rounded-full bg-surface-active border-2 border-surface flex items-center justify-center text-[10px] font-bold text-foreground-tertiary">
                               +{(project.members.length - 3)}
                             </div>
                           )}
                           {(!project.members || project.members.length === 0) && (
                             <span className="text-[11px] text-muted font-medium">No members</span>
                           )}
                        </div>
                        {project.dueDate && (
                           <div className={clsx("flex items-center gap-1.5 text-[11px] font-bold", isOverdue ? "text-danger" : "text-muted")}>
                              <Calendar size={12} />
                              {format(parseISO(project.dueDate), 'MMM d')}
                           </div>
                        )}
                     </div>

                     {/* Expanded Detail */}
                     <AnimatePresence>
                       {expandedId === project._id && (
                         <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.2 }}
                           className="overflow-hidden bg-surface-hover mx--6 px-6 mt-4 pt-4 border-t border-border"
                           onClick={(e) => e.stopPropagation()}
                         >
                           {project.members && project.members.length > 0 && (
                             <>
                               <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Team Members</p>
                               <div className="grid grid-cols-1 gap-2">
                                 {project.members.map((memberId: string, i: number) => (
                                   <div key={i} className="flex items-center gap-2 rounded-lg py-1">
                                     <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white bg-accent shrink-0">
                                       {memberId?.charAt(0)?.toUpperCase() || '?'}
                                     </div>
                                     <p className="text-[12px] font-medium text-foreground truncate">{memberId}</p>
                                   </div>
                                 ))}
                               </div>
                             </>
                           )}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </ContextMenu>
                 </motion.div>
               );
            })}
          </div>
        )}
      </div>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProject} />

      <ConfirmDialog
        open={!!projectToDelete}
        title="Delete project"
        message={
          <>
            Are you sure you want to delete <strong>{projectToDelete?.name || 'this project'}</strong>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete project"
        onConfirm={handleConfirmDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
}
