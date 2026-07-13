import { useState } from 'react';
import { Target, Activity, Plus, Check, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { format, subDays } from 'date-fns';

const MOCK_HABITS = [
  { id: 'h1', name: 'Morning Workout', streak: 12, longestStreak: 15, color: 'text-blue-500 bg-blue-100', history: [true, true, true, false, true, true, true] },
  { id: 'h2', name: 'Read 20 pages', streak: 5, longestStreak: 30, color: 'text-purple-500 bg-purple-100', history: [false, true, true, true, true, true, false] },
];

const MOCK_GOALS = [
  { id: 'g1', title: 'Launch TaMaD MVP', progress: 75, type: 'professional', milestones: 4, completed: 3 },
  { id: 'g2', title: 'Run a Half Marathon', progress: 30, type: 'health', milestones: 5, completed: 1 },
];

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');

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

        <button className="btn-primary flex items-center justify-center gap-2 px-4 py-2 w-auto">
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
          {MOCK_HABITS.map((habit) => (
            <div key={habit.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', habit.color)}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{habit.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">🔥 {habit.streak} Day Streak (Best: {habit.longestStreak})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[6, 5, 4, 3, 2, 1, 0].map((daysAgo, i) => {
                  const date = subDays(new Date(), daysAgo);
                  const isCompleted = habit.history[i];
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
          {MOCK_GOALS.map((goal) => (
            <div key={goal.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold capitalize mb-3 inline-block">
                    {goal.type}
                  </span>
                  <h3 className="font-bold text-xl text-gray-800">{goal.title}</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-2 flex justify-between text-sm font-semibold text-gray-700">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 font-medium bg-gray-50 p-4 rounded-2xl">
                <span>Milestones</span>
                <span className="text-gray-800">{goal.completed} / {goal.milestones} Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
