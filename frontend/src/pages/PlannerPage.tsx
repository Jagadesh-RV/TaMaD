import { useState, useEffect } from 'react';
import { Target, Activity, Plus, Check, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { format, subDays } from 'date-fns';
import { useGoalStore } from '../store/goalStore';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';
import GoalModal from '../components/planner/GoalModal';
import HabitModal from '../components/planner/HabitModal';
import EmptyState from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const workspace = useAuthStore(s => s.workspace);

  const { goals, fetchGoals, createGoal } = useGoalStore() as any;
  const { habits, fetchHabits, createHabit } = useHabitStore() as any;

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) {
      fetchGoals(workspaceId);
      fetchHabits(workspaceId);
    }
  }, [fetchGoals, fetchHabits, workspaceId]);

  const handleSaveGoal = async (data: any) => {
    await createGoal({ ...data, workspaceId });
  };

  const handleSaveHabit = async (data: any) => {
    await createHabit({ ...data, workspaceId });
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10 shrink-0">
        <div>
          <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-none mb-1 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <Target size={22} />
             </div>
             Planner & Habits
          </h1>
          <p className="text-[14px] text-foreground-secondary mt-2 pl-[52px]">Track daily reps and visualize long-term goals.</p>
        </div>

        <button 
          onClick={() => activeTab === 'habits' ? setIsHabitModalOpen(true) : setIsGoalModalOpen(true)}
          className="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl"
        >
          <Plus size={18} />
          <span className="font-semibold text-[13px]">New {activeTab === 'habits' ? 'Habit' : 'Goal'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-active p-1.5 rounded-2xl mb-8 self-start shadow-inner border border-border/50">
        <button
          onClick={() => setActiveTab('habits')}
          className={clsx(
            'px-8 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300',
            activeTab === 'habits' ? 'bg-surface text-foreground shadow-sm ring-1 ring-border' : 'text-foreground-secondary hover:text-foreground'
          )}
        >
          Daily Habits
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={clsx(
            'px-8 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300',
            activeTab === 'goals' ? 'bg-surface text-foreground shadow-sm ring-1 ring-border' : 'text-foreground-secondary hover:text-foreground'
          )}
        >
          Goal Journey
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'habits' ? (
            <div className="grid gap-4">
              {habits.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No habits yet"
                  description="Small daily reps compound into results. Build one habit and let consistency do the heavy lifting."
                  action={{ label: 'New Habit', onClick: () => setIsHabitModalOpen(true) }}
                />
              ) : habits.map((habit: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  key={habit._id} 
                  className="bg-surface rounded-3xl border border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xs hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-4 mb-6 md:mb-0">
                    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', habit.color || 'bg-accent/10 text-accent')}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground text-[16px] mb-1">{habit.name}</h3>
                      <p className="text-[12px] text-foreground-secondary font-medium">🔥 {habit.streak || 0} Day Streak <span className="opacity-60">(Best: {habit.longestStreak || 0})</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {[6, 5, 4, 3, 2, 1, 0].map((daysAgo, i) => {
                      const date = subDays(new Date(), daysAgo);
                      const isCompleted = false; // Mock logic
                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <span className="text-[10px] text-foreground-tertiary font-bold uppercase tracking-wider">{format(date, 'eee')}</span>
                          <button
                            className={clsx(
                              'w-10 h-10 rounded-[10px] flex items-center justify-center transition-all',
                              isCompleted
                                ? 'bg-accent text-white shadow-sm ring-1 ring-accent ring-offset-1 ring-offset-surface'
                                : 'bg-surface-active border border-border text-transparent hover:bg-border transition-colors'
                            )}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {goals.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="No goals yet"
                  description="A goal gives your effort a direction. Set a long-term target and track your climb."
                  action={{ label: 'New Goal', onClick: () => setIsGoalModalOpen(true) }}
                  className="col-span-2"
                />
              ) : goals.map((goal: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  key={goal._id} 
                  className="group relative bg-surface rounded-[32px] border border-border p-8 shadow-xs hover:shadow-soft hover:border-foreground-tertiary transition-all overflow-hidden"
                >
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="px-3 py-1 bg-surface-active text-foreground-secondary border border-border rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                        {goal.type || 'Professional'}
                      </span>
                      <h3 className="font-display font-bold text-[22px] text-foreground leading-tight tracking-tight">{goal.title}</h3>
                    </div>
                  </div>

                  <div className="mb-3 flex justify-between text-[13px] font-bold text-foreground">
                    <span>Journey Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  
                  <div className="h-2.5 bg-surface-active border border-border rounded-full overflow-hidden mb-8 relative">
                    <div className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-1000 ease-out shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]" style={{ width: `${goal.progress || 0}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-foreground-secondary font-medium bg-surface-hover p-4 rounded-2xl border border-border">
                    <span className="flex items-center gap-2"><Target size={14} className="text-foreground-tertiary" /> Milestones</span>
                    <span className="text-foreground font-bold">{goal.milestones?.filter((m:any)=>m.completed).length || 0} / {goal.milestones?.length || 0} Reached</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <GoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />
      
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
      />
    </div>
  );
}
