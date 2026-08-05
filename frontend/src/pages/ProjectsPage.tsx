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
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import ProjectModal from '../components/projects/ProjectModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';

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
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
            Project management
          </p>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Track progress, manage deadlines, and keep your team aligned.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Summary Bar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects },
          { label: 'Total Tasks', value: totalTasksAll },
          { label: 'Avg Progress', value: `${avgProgress}%` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-muted)' }}>
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Projects Grid */}
      {isLoading && <LoadingSpinner text="Loading projects..." />}

      {!isLoading && error && <ErrorState message={error} onRetry={retry} />}

      {!isLoading && !error && projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={32} />
          </div>
          <p className="empty-state-title">No projects yet</p>
          <p className="empty-state-description">
            Create your first project to start tracking tasks and progress.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project: any, index: number) => {
            const isExpanded = expandedId === project._id;
            const statusStyle = getStatusStyle(project.status || 'active');
            const stats = getProjectStats(project._id);
            const isOverdue = project.dueDate && (() => {
              try { return isPast(parseISO(project.dueDate)); } catch { return false; }
            })();

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="card overflow-hidden transition-all"
                style={{
                  borderColor: isExpanded ? (project.color || 'var(--color-accent)') : undefined,
                  boxShadow: isExpanded ? 'var(--shadow-medium)' : undefined,
                }}
              >
                <div className="cursor-pointer p-5" onClick={() => toggleExpand(project._id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ background: project.color || 'var(--color-accent)' }}
                      >
                        {project.name?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
                            {project.name}
                          </h3>
                          <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: '10px' }}>
                            {project.status || 'active'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="btn btn-ghost btn-icon-sm flex-shrink-0 transition-colors hover:bg-[color:var(--color-danger-light)] hover:text-[color:var(--color-danger)]"
                        style={{ color: 'var(--color-muted)' }}
                        title="Delete project"
                        aria-label={`Delete ${project.name || 'project'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project._id);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon-sm flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                        {stats.completedTasks} of {stats.totalTasks} tasks
                      </span>
                      <span className="text-xs font-bold" style={{ color: project.color || 'var(--color-accent)' }}>
                        {stats.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        className="progress-bar-fill"
                        style={{ background: project.color || 'var(--color-accent)' }}
                      />
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} style={{ color: 'var(--color-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {project.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    {project.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-muted)' }} />
                        <span className="text-xs font-medium" style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                          {(() => { try { return format(parseISO(project.dueDate), 'MMM d, yyyy'); } catch { return project.dueDate; } })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t px-5 py-4" style={{ borderColor: 'var(--color-border-light)' }}>
                        {project.members && project.members.length > 0 && (
                          <>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                              Team Members
                            </p>
                            <div className="flex flex-col gap-2">
                              {project.members.map((memberId: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg p-2"
                                  style={{ background: 'var(--color-surface-hover)' }}
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--color-accent)' }}>
                                    {memberId?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{memberId}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

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
