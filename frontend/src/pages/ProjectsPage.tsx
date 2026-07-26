import { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  FolderKanban,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isPast, parseISO } from 'date-fns';
import clsx from 'clsx';
import { PROJECTS, TEAM_MEMBERS } from '../data/seedData';

export default function ProjectsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const projects = useMemo(
    () =>
      PROJECTS.map((project) => ({
        ...project,
        members: project.members
          .map((id) => TEAM_MEMBERS.find((m) => m.id === id))
          .filter(Boolean),
      })),
    []
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'var(--color-success-light)', color: 'var(--color-success)' };
      case 'completed':
        return { bg: 'var(--color-info-light)', color: 'var(--color-info)' };
      case 'on-hold':
        return { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' };
      default:
        return { bg: 'var(--color-surface-active)', color: 'var(--color-muted)' };
    }
  };

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]"
            style={{ color: 'var(--color-muted)' }}
          >
            Project management
          </p>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Track progress, manage deadlines, and keep your team aligned.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Summary Bar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects.length },
          {
            label: 'Total Tasks',
            value: projects.reduce((s, p) => s + p.totalTasks, 0),
          },
          {
            label: 'Avg Progress',
            value: `${Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)}%`,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--color-muted)' }}
            >
              {stat.label}
            </p>
            <p
              className="mt-2 text-2xl font-bold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderKanban size={32} />
          </div>
          <p className="empty-state-title">No projects yet</p>
          <p className="empty-state-description">
            Create your first project to start tracking tasks and progress.
          </p>
          <button className="btn btn-primary">
            <Plus size={16} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => {
            const isExpanded = expandedId === project.id;
            const statusStyle = getStatusStyle(project.status);
            const isOverdue =
              project.dueDate && isPast(parseISO(project.dueDate));

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="card overflow-hidden transition-all"
                style={{
                  borderColor: isExpanded ? project.color : undefined,
                  boxShadow: isExpanded ? 'var(--shadow-medium)' : undefined,
                }}
              >
                {/* Card Header */}
                <div
                  className="cursor-pointer p-5"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ background: project.color }}
                      >
                        {project.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-sm font-bold"
                            style={{ color: 'var(--color-foreground)' }}
                          >
                            {project.name}
                          </h3>
                          <span
                            className="badge"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              fontSize: '10px',
                            }}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon-sm flex-shrink-0"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {project.completedTasks} of {project.totalTasks} tasks
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: project.color }}
                      >
                        {project.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        className="progress-bar-fill"
                        style={{ background: project.color }}
                      />
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 4).map((member) =>
                          member ? (
                            <div
                              key={member.id}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                              style={{
                                background: member.avatarColor,
                                border: '2px solid var(--color-surface)',
                              }}
                              title={member.name}
                            >
                              {member.initials}
                            </div>
                          ) : null
                        )}
                        {project.members.length > 4 && (
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{
                              background: 'var(--color-surface-active)',
                              color: 'var(--color-muted)',
                              border: '2px solid var(--color-surface)',
                            }}
                          >
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {project.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={13}
                        style={{
                          color: isOverdue
                            ? 'var(--color-danger)'
                            : 'var(--color-muted)',
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: isOverdue
                            ? 'var(--color-danger)'
                            : 'var(--color-muted)',
                        }}
                      >
                        {format(parseISO(project.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
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
                      <div
                        className="border-t px-5 py-4"
                        style={{ borderColor: 'var(--color-border-light)' }}
                      >
                        <p
                          className="mb-3 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Team Members
                        </p>
                        <div className="flex flex-col gap-2">
                          {project.members.map((member) =>
                            member ? (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 rounded-lg p-2"
                                style={{
                                  background: 'var(--color-surface-hover)',
                                }}
                              >
                                <div
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                  style={{
                                    background: member.avatarColor,
                                  }}
                                >
                                  {member.initials}
                                </div>
                                <div>
                                  <p
                                    className="text-sm font-medium"
                                    style={{
                                      color: 'var(--color-foreground)',
                                    }}
                                  >
                                    {member.name}
                                  </p>
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-muted)' }}
                                  >
                                    {member.role}
                                  </p>
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="btn btn-primary btn-sm">
                            <CheckCircle2 size={14} />
                            View Tasks
                          </button>
                          <button className="btn btn-secondary btn-sm">
                            <Users size={14} />
                            Manage Team
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
