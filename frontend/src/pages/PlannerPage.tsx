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
    <div className="page flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="page-title mb-0 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-500">
              <Target size={24} className="fill-indigo-500" />
            </div>
            Planner & Habits
          </h1>
          <p className="text-secondary mt-2 text-sm">Track your daily habits and long-term goals.</p>
        </div>

        <button 
          onClick={() => activeTab === 'habits' ? setIsHabitModalOpen(true) : setIsGoalModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2 w-auto"
        >
          <Plus size={20} />
          New {activeTab === 'habits' ? 'Habit' : 'Goal'}
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 self-start">
        <button
          onClick={() => setActiveTab('habits')}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'habits' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Daily Habits
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'goals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Long-Term Goals
        </button>
      </div>

      {activeTab === 'habits' ? (
        <div className="grid gap-4">
          {habits.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No habits yet"
              description="Small daily reps compound into results. Build one habit and let consistency do the heavy lifting."
              steps={[
                'Click New Habit and name your daily practice',
                'Check in every day to grow your streak',
                'Watch small wins turn into long-term momentum',
              ]}
              action={{ label: 'New Habit', onClick: () => setIsHabitModalOpen(true) }}
            />
          ) : habits.map((habit: any) => (
            <div key={habit._id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', habit.color)}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{habit.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">🔥 {habit.streak || 0} Day Streak (Best: {habit.longestStreak || 0})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[6, 5, 4, 3, 2, 1, 0].map((daysAgo, i) => {
                  const date = subDays(new Date(), daysAgo);
                  // Quick mock logic for UI since real backend history needs custom endpoint handling
                  const isCompleted = false; 
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">{format(date, 'eee')}</span>
                      <button
                        className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isCompleted
                            ? clsx(habit.color.split(' ')[1], habit.color.split(' ')[0], 'shadow-inner border border-transparent')
                            : 'bg-gray-50 border border-gray-200 text-transparent hover:bg-gray-100'
                        )}
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  );
                })}
                <button className="p-2 text-gray-400 hover:text-gray-700 ml-4">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="A goal gives your effort a direction. Set a long-term target and break it into milestones you can actually reach."
              steps={[
                'Click New Goal and picture the finish line',
                'Define milestones to make progress visible',
                'Track your climb until the goal is done',
              ]}
              action={{ label: 'New Goal', onClick: () => setIsGoalModalOpen(true) }}
              className="col-span-2"
            />
          ) : goals.map((goal: any) => (
            <div key={goal._id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold capitalize mb-3 inline-block">
                    {goal.type || 'Professional'}
                  </span>
                  <h3 className="font-bold text-xl text-gray-800">{goal.title}</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-2 flex justify-between text-sm font-semibold text-gray-700">
                <span>Progress</span>
                <span>{goal.progress || 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 font-medium bg-gray-50 p-4 rounded-2xl">
                <span>Milestones</span>
                <span className="text-gray-800">{goal.milestones?.filter((m:any)=>m.completed).length || 0} / {goal.milestones?.length || 0} Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
