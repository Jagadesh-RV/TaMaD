import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useTeamStore } from '../../store/teamStore';
import { ChevronDown, Check, Plus, Users, Building2, User } from 'lucide-react';
import clsx from 'clsx';
import CreateTeamModal from '../teams/CreateTeamModal';
import JoinTeamModal from '../teams/JoinTeamModal';

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { teams, fetchTeams } = useTeamStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchTeams();
  }, [fetchWorkspaces, fetchTeams]);

  // Set default workspace if none selected
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      // Prefer personal workspace as default if available
      const personal = workspaces.find(w => w.type === 'personal');
      setCurrentWorkspace(personal || workspaces[0]);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  if (!currentWorkspace) return null;

  const personalWorkspaces = workspaces.filter(w => w.type === 'personal' || !w.teamId);
  const teamWorkspaces = workspaces.filter(w => w.type === 'team' && w.teamId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        style={{ background: 'var(--color-surface-hover)', color: 'var(--color-foreground)' }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {currentWorkspace.type === 'personal' || !currentWorkspace.teamId ? (
            <User size={16} className="shrink-0 text-[var(--color-accent)]" />
          ) : (
            <Building2 size={16} className="shrink-0 text-[var(--color-success)]" />
          )}
          <span className="truncate">{currentWorkspace.name}</span>
        </div>
        <ChevronDown size={14} className="shrink-0 text-[var(--color-muted)]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {/* Personal Section */}
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Personal
              </div>
              {personalWorkspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <User size={14} className="shrink-0 text-[var(--color-muted)]" />
                    <span className={clsx('truncate', currentWorkspace._id === ws._id && 'font-bold')}>
                      {ws.name}
                    </span>
                  </div>
                  {currentWorkspace._id === ws._id && <Check size={14} className="shrink-0 text-[var(--color-accent)]" />}
                </button>
              ))}

              {/* Teams Section */}
              {teams.length > 0 && (
                <>
                  <div className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    Teams
                  </div>
                  {teams.map(team => {
                    // Find workspaces belonging to this team
                    const twsList = teamWorkspaces.filter(tw => tw.teamId === team._id);
                    return twsList.map(ws => (
                      <button
                        key={ws._id}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
                      >
                        <div className="flex items-center gap-2 truncate pl-2 border-l-2" style={{ borderColor: team.color || 'var(--color-success)' }}>
                          <span className={clsx('truncate', currentWorkspace._id === ws._id && 'font-bold')}>
                            {ws.name}
                          </span>
                        </div>
                        {currentWorkspace._id === ws._id && <Check size={14} className="shrink-0 text-[var(--color-accent)]" />}
                      </button>
                    ));
                  })}
                </>
              )}
            </div>
            
            <div className="border-t border-[var(--color-border-light)] p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateTeam(true);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
              >
                <Plus size={14} />
                Create Team
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowJoinTeam(true);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]"
              >
                <Users size={14} />
                Join Team
              </button>
            </div>
          </div>
        </>
      )}

      {showCreateTeam && <CreateTeamModal onClose={() => setShowCreateTeam(false)} />}
      {showJoinTeam && <JoinTeamModal onClose={() => setShowJoinTeam(false)} />}
    </div>
  );
}
