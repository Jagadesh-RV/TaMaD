import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useTeamStore } from '../store/teamStore';
import { useTaskStore } from '../store/taskStore';
import { useAgileStore } from '../store/agileStore';
import { useRealtime } from '../providers/RealtimeProvider';
import DashboardWidgetEngine from '../components/dashboard/DashboardWidgetEngine';
import LivePresenceStack from '../components/teams/LivePresenceStack';
import { Settings, Save, X, Users, CheckSquare, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { SkeletonStatGrid } from '../components/ui/Skeleton';
import clsx from 'clsx';

function TeamStatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
  onClick,
  critical = false,
}: {
  label: string;
  value: number | string;
  sub: string;
  color: string;
  icon: React.ElementType;
  onClick?: () => void;
  critical?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border transition-all hover:border-[color:var(--color-foreground-tertiary)] cursor-pointer bg-[color:var(--color-surface)] p-4 shadow-xs"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-[color:var(--color-foreground-secondary)]">{label}</span>
        <span
          className="flex items-center justify-center rounded-md"
          style={{ width: 24, height: 24, color: critical ? 'var(--color-danger)' : 'var(--color-foreground-secondary)' }}
        >
          <Icon size={14} />
        </span>
      </div>
      <div
        className="text-3xl font-bold leading-none tracking-tight"
        style={{ color: critical ? 'var(--color-danger)' : 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
      <span className="text-[12px] font-medium text-[color:var(--color-foreground-tertiary)] mt-1">{sub}</span>
    </div>
  );
}

export default function TeamDashboardPage() {
  const navigate = useNavigate();
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { dashboard, fetchDashboard, updateLayout, saveDashboard, loading } = useDashboardStore();
  const { members, getMembers, currentTeam } = useTeamStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { sprints, fetchSprints } = useAgileStore();
  const { onlineUsers } = useRealtime();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchDashboard(currentWorkspace._id);
      fetchTasks(currentWorkspace._id);
    }
  }, [currentWorkspace?._id, fetchDashboard, fetchTasks]);

  useEffect(() => {
    if (currentWorkspace?.type === 'team' && currentWorkspace.teamId) {
      getMembers(currentWorkspace.teamId);
      fetchSprints(currentWorkspace._id, '');
    }
  }, [currentWorkspace?.type, currentWorkspace?.teamId, currentWorkspace?._id, getMembers, fetchSprints]);

  const presence = members.slice(0, 8).map(m => ({
    name: m.userId.name,
    avatarUrl: m.userId.avatarUrl,
    isOnline: onlineUsers.includes(m.userId._id),
  }));

  const today = format(new Date(), 'yyyy-MM-dd');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const activeSprint = sprints.find(s => s.status === 'active');
  const sprintTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint._id) : [];
  const sprintDone = sprintTasks.filter(t => t.status === 'done').length;
  const sprintProgress = sprintTasks.length > 0 ? Math.round((sprintDone / sprintTasks.length) * 100) : 0;

  if (!currentWorkspace) return null;

  const handleSave = async () => {
    await saveDashboard();
    setIsEditing(false);
  };

  return (
    <div className="page pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
              {currentWorkspace.name}
            </h1>
            <p className="text-[13px] mt-1.5 font-medium" style={{ color: 'var(--color-foreground-secondary)' }}>
              {format(new Date(), 'EEEE, MMMM d')}
              {onlineUsers.length > 0 && (
                <span style={{ color: 'var(--color-success)' }}>
                  {' '}· {onlineUsers.length + 1} members online
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LivePresenceStack members={presence} />
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  <X size={14} className="mr-1.5" />Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save size={14} className="mr-1.5" />Save Layout
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Settings size={14} className="mr-1.5" />Customize
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Team stat cards */}
      <div className="mb-6">
        {loading ? (
          <SkeletonStatGrid count={4} />
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <TeamStatCard
              label="In Progress"
              value={inProgressTasks}
              sub="active tasks"
              color="var(--color-info)"
              icon={Activity}
              onClick={() => navigate('/tasks')}
            />
            <TeamStatCard
              label="Overdue"
              value={overdueTasks}
              sub={overdueTasks > 0 ? 'need attention' : 'all clear'}
              color={overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
              icon={AlertTriangle}
              onClick={() => navigate('/tasks')}
              critical={overdueTasks > 0}
            />
            <TeamStatCard
              label="Team Members"
              value={members.length}
              sub={`${onlineUsers.length + 1} online now`}
              color="var(--color-accent)"
              icon={Users}
              onClick={() => navigate('/team/members')}
            />
            <TeamStatCard
              label={activeSprint ? 'Sprint Progress' : 'Completion'}
              value={activeSprint ? `${sprintProgress}%` : `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
              sub={activeSprint ? `${sprintDone}/${sprintTasks.length} tasks done` : `${completedTasks} of ${totalTasks} tasks`}
              color="var(--color-success)"
              icon={TrendingUp}
              onClick={() => navigate(activeSprint ? '/agile/board' : '/analytics')}
            />
          </div>
        )}
      </div>

      {/* Sprint banner if active */}
      {activeSprint && (
        <div
          className="mb-6 rounded-xl border px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-accent)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
            >
              <CheckSquare size={16} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--color-foreground)' }}>
                Active Sprint: {activeSprint.name}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--color-foreground-secondary)' }}>
                {sprintTasks.length} tasks · {sprintProgress}% complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="progress-bar hidden sm:block" style={{ width: 120 }}>
              <div className="progress-bar-fill" style={{ width: `${sprintProgress}%` }} />
            </div>
            <button
              onClick={() => navigate('/agile/board')}
              className="btn btn-sm btn-outline-accent"
            >
              View Board
            </button>
          </div>
        </div>
      )}

      {/* Dashboard widgets */}
      {!loading && dashboard ? (
        <DashboardWidgetEngine
          layout={dashboard.layout}
          onChange={updateLayout}
          isEditing={isEditing}
        />
      ) : loading ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-5 space-y-3 animate-pulse">
                <div className="rounded" style={{ height: 14, width: '50%', background: 'var(--color-surface-active)' }} />
                <div className="rounded" style={{ height: 200, background: 'var(--color-surface-active)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="empty-state-icon mb-4">
            <Activity size={24} />
          </div>
          <p className="empty-state-title">No dashboard configured</p>
          <p className="empty-state-description">
            Your team dashboard will appear here once configured.
          </p>
        </div>
      )}
    </div>
  );
}
