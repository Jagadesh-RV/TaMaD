import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTeamStore } from '../../store/teamStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { UserPlus, Users, ShieldCheck, Activity, Zap, Flame, Calendar as CalendarIcon, Clock, HeartPulse, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, var(--color-accent), var(--color-info))',
  'linear-gradient(135deg, var(--color-success), #34d399)',
  'linear-gradient(135deg, var(--color-warning), var(--color-danger))',
  'linear-gradient(135deg, #a78bfa, var(--color-info))',
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function MembersPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { currentTeam, members, getMembers, updateMemberRole, removeMember, inviteMember } = useTeamStore();

  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (currentWorkspace?.teamId) {
      getMembers(currentWorkspace.teamId);
    }
  }, [currentWorkspace?.teamId, getMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.teamId) return;

    setLoading(true);
    try {
      await inviteMember(currentWorkspace.teamId, inviteEmail, 'default-role-id', 'email');
      setInviteEmail('');
      toast.success('Invite sent');
    } catch {
      // error handled in store
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace?.teamId) {
    return <div className="p-8 text-center text-[13px] font-medium text-muted">This workspace does not belong to a team.</div>;
  }

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-10 shrink-0">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
            <ShieldCheck size={14} />
            {currentTeam?.name || 'Team HQ'}
          </p>
          <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-none">Team Pulse</h1>
          <p className="text-[14px] text-foreground-secondary mt-2">See who's online, workload distribution, and sprint health.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 shadow-xs">
          <Users size={16} className="text-accent" />
          <span className="text-[14px] font-bold text-foreground">{members.length}</span>
          <span className="text-[12px] font-medium text-muted">Members Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Sprint Pulse Widget */}
        <div className="xl:col-span-1 bg-surface rounded-[24px] border border-border p-6 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-success" />
          <h2 className="text-[14px] font-display font-semibold text-foreground flex items-center gap-2 mb-4">
            <HeartPulse size={16} className="text-success" />
            Sprint Pulse
          </h2>
          <div className="flex items-end gap-3 mb-6">
            <div className="text-[48px] font-display font-bold tracking-tighter leading-none text-foreground">84<span className="text-[20px] text-muted">%</span></div>
            <div className="pb-2 text-[12px] font-medium text-success flex items-center gap-1"><Flame size={12} /> On Track</div>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-[12px] font-medium">
               <span className="text-foreground-secondary">Completed</span>
               <span className="text-foreground font-bold">42 pts</span>
             </div>
             <div className="flex items-center justify-between text-[12px] font-medium">
               <span className="text-foreground-secondary">In Progress</span>
               <span className="text-foreground font-bold">12 pts</span>
             </div>
          </div>
        </div>

        {/* Workload Heatmap Widget */}
        <div className="xl:col-span-2 bg-surface rounded-[24px] border border-border p-6 shadow-xs">
          <h2 className="text-[14px] font-display font-semibold text-foreground flex items-center gap-2 mb-6">
            <Activity size={16} className="text-accent" />
            Workload Heatmap
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {members.slice(0, 5).map((m: any, i: number) => {
               // Mock workload data
               const load = Math.floor(Math.random() * 100);
               const isOnline = Math.random() > 0.5;
               return (
                 <div key={m.userId?._id || i} className="flex flex-col items-center gap-3">
                   <div className="relative">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[14px] font-bold shadow-sm" style={{ background: gradientFor(m.userId?.name || 'U') }}>
                       {m.userId?.name?.charAt(0) || 'U'}
                     </div>
                     {isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-surface" />}
                   </div>
                   <div className="text-center">
                     <p className="text-[11px] font-bold text-foreground line-clamp-1">{m.userId?.name?.split(' ')[0]}</p>
                   </div>
                   <div className="w-full h-1.5 bg-surface-active rounded-full overflow-hidden mt-1">
                     <div className={clsx("h-full rounded-full", load > 80 ? 'bg-danger' : load > 50 ? 'bg-warning' : 'bg-success')} style={{ width: `${load}%` }} />
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Team Members List */}
        <div className="xl:col-span-2 bg-surface rounded-[24px] border border-border p-6 shadow-xs">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-[14px] font-display font-semibold text-foreground">Who's Online</h2>
             <button className="text-[12px] font-bold text-accent hover:text-accent-hover transition-colors">Manage Roles</button>
           </div>
           
           <div className="space-y-2">
             {members.map((member: any, index: number) => (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                 key={member.userId?._id || index}
                 className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors group"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ background: gradientFor(member.userId?.name || 'U') }}>
                     {member.userId?.name?.charAt(0) || 'U'}
                   </div>
                   <div>
                     <p className="text-[13px] font-bold text-foreground group-hover:text-accent transition-colors">{member.userId?.name || 'Unknown User'}</p>
                     <p className="text-[11px] font-medium text-foreground-tertiary flex items-center gap-1.5">
                       {member.userId?.email}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="px-2.5 py-1 rounded-full bg-surface-hover border border-border text-[10px] font-bold uppercase tracking-widest text-muted">
                     {member.role}
                   </span>
                 </div>
               </motion.div>
             ))}
           </div>
           
           {/* Invite Box inside members list */}
           <div className="mt-6 pt-6 border-t border-border">
             <form onSubmit={handleInvite} className="flex gap-3">
               <input
                 type="email"
                 value={inviteEmail}
                 onChange={(e) => setInviteEmail(e.target.value)}
                 placeholder="Invite by email..."
                 className="flex-1 h-10 rounded-xl border border-border bg-surface-active px-4 text-[13px] font-medium text-foreground outline-none transition-all placeholder:text-muted hover:border-border focus:border-accent focus:ring-1 focus:ring-accent"
                 required
               />
               <button
                 type="submit"
                 disabled={loading}
                 className="h-10 px-5 rounded-xl bg-foreground text-surface text-[13px] font-bold transition-all hover:bg-foreground-secondary flex items-center gap-2"
               >
                 <UserPlus size={16} />
                 Invite
               </button>
             </form>
           </div>
        </div>

        {/* Team Timeline Widget */}
        <div className="xl:col-span-1 bg-surface rounded-[24px] border border-border p-6 shadow-xs flex flex-col h-[500px]">
          <h2 className="text-[14px] font-display font-semibold text-foreground flex items-center gap-2 mb-6">
            <Clock size={16} className="text-info" />
            Team Timeline
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative" style={{ scrollbarWidth: 'none' }}>
            <div className="absolute top-2 bottom-2 left-4 w-px bg-border z-0" />
            
            {[
              { user: 'Alex', action: 'completed', target: 'Homepage Redesign', time: '10m ago', icon: <CheckCircle2 size={12} className="text-success" /> },
              { user: 'Sam', action: 'commented on', target: 'API Specs', time: '1h ago', icon: <Users size={12} className="text-info" /> },
              { user: 'Jordan', action: 'moved', target: 'Auth Flow', time: '2h ago', icon: <Activity size={12} className="text-warning" /> },
              { user: 'Taylor', action: 'created', target: 'Q3 Roadmap', time: '4h ago', icon: <Zap size={12} className="text-accent" /> },
              { user: 'Alex', action: 'completed', target: 'Fix Login Bug', time: '5h ago', icon: <CheckCircle2 size={12} className="text-success" /> },
            ].map((event, idx) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="relative z-10 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm shrink-0 mt-1">
                  {event.icon}
                </div>
                <div>
                  <p className="text-[12px] text-foreground leading-snug">
                    <span className="font-bold">{event.user}</span> {event.action} <span className="font-semibold">{event.target}</span>
                  </p>
                  <p className="text-[10px] text-muted font-medium mt-0.5">{event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
