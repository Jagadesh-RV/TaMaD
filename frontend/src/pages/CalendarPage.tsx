import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import clsx from 'clsx';
import { useTaskStore } from '../store/taskStore';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, loading, fetchTasks } = useTaskStore() as any;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (day: Date) => {
    return tasks.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), day));
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-primary',
    low: 'bg-gray-400',
  };

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="page-title mb-0">Calendar</h1>
          <p className="text-secondary mt-1 text-sm font-medium">Schedule and track deadlines.</p>
        </div>

        <div className="flex items-center gap-4">
          {loading && (
            <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Syncing</span>
            </div>
          )}
          <div className="flex items-center bg-gray-100 border border-border rounded-lg p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:text-gray-900 rounded-md transition-colors text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <span className="w-36 text-center font-bold text-gray-900 uppercase tracking-wider text-sm">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:text-gray-900 rounded-md transition-colors text-gray-500">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="btn-primary flex items-center justify-center gap-2 px-6 py-2 w-auto">
            <Plus size={20} />
            New Event
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={clsx(
                  'p-2 border-b border-r border-border transition-all duration-200 cursor-pointer group',
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'
                )}
              >
                <div
                  className={clsx(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-2 transition-colors',
                    today
                      ? 'bg-primary text-white shadow-sm'
                      : !isCurrentMonth
                      ? 'text-gray-400'
                      : 'text-gray-700 group-hover:bg-gray-200'
                  )}
                >
                  {format(day, 'd')}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayTasks.map((task: any) => (
                    <div
                      key={task._id}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 transition-colors truncate border border-gray-100 cursor-pointer group/task"
                    >
                      <div className={clsx('w-2 h-2 rounded-full shrink-0', priorityColors[task.priority] || priorityColors.medium)} />
                      <span className="truncate text-gray-700 font-medium group-hover/task:text-gray-900">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}