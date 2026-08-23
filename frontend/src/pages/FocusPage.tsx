import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import api from '../utils/api';
import { motion } from 'framer-motion';

const PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long Focus', work: 50, break: 10 },
  { label: 'Quick Sprint', work: 15, break: 3 },
];

export default function FocusPage() {
  const [preset, setPreset] = useState(0);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [minutes, setMinutes] = useState(PRESETS[0].work);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';
  const { tasks, fetchTasks, updateTask } = useTaskStore() as any;
  
  // Minimalist tasks (Today/Urgent)
  const focusTasks = tasks.filter((t: any) => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high')).slice(0, 5);

  useEffect(() => {
    if (workspaceId && tasks.length === 0) fetchTasks(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    setMinutes(mode === 'work' ? PRESETS[preset].work : PRESETS[preset].break);
    setSeconds(0);
    setRunning(false);
  }, [preset, mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s > 0) return s - 1;
          setMinutes((m) => {
            if (m > 0) {
              setSeconds(59);
              return m - 1;
            }
            handleTimerDone();
            return 0;
          });
          return 0;
        });
      }, 1000) as any;
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const handleTimerDone = () => {
    setRunning(false);
    if (mode === 'work') {
      setCompleted((c) => c + 1);
      toast.success('Focus session complete! Take a breather.', { duration: 4000 });
      setMode('break');
    } else {
      toast.success('Break over! Let\'s get back to it.', { duration: 3000 });
      setMode('work');
    }
  };

  const resetTimer = () => {
    setRunning(false);
    setMinutes(mode === 'work' ? PRESETS[preset].work : PRESETS[preset].break);
    setSeconds(0);
  };

  const progress = (() => {
    const total = (mode === 'work' ? PRESETS[preset].work : PRESETS[preset].break) * 60;
    const remaining = minutes * 60 + seconds;
    return ((total - remaining) / total) * 100;
  })();

  const circumference = 2 * Math.PI * 110;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-none mb-1 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
               <Target size={22} />
             </div>
             Focus Mode
          </h1>
          <p className="text-[14px] text-foreground-secondary mt-2 pl-[52px]">Deep work without distractions.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border text-foreground px-4 py-2 rounded-xl text-[13px] font-medium shadow-sm">
          <CheckCircle2 size={16} className="text-accent" />
          {completed} sessions today
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
        {/* Main Timer Section */}
        <div className="flex-1 bg-surface rounded-[32px] border border-border shadow-xs p-10 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <motion.div 
            animate={{ scale: running ? [1, 1.05, 1] : 1, opacity: running ? 0.3 : 0.1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={clsx(
              "absolute w-[600px] h-[600px] rounded-full blur-[120px] -z-10 transition-colors duration-1000",
              mode === 'work' ? 'bg-accent' : 'bg-success'
            )} 
          />

          {/* Mode Toggle */}
          <div className="flex bg-surface-active p-1.5 rounded-2xl mb-12 shadow-inner border border-border/50">
            {['work', 'break'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as 'work' | 'break')}
                className={clsx(
                  'px-10 py-2.5 rounded-xl text-[13px] font-bold capitalize transition-all duration-300',
                  mode === m
                    ? 'bg-surface text-foreground shadow-sm ring-1 ring-border'
                    : 'text-foreground-secondary hover:text-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Minimalist SVG Timer */}
          <div className="relative w-80 h-80 mb-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" fill="none" stroke="var(--color-surface-active)" strokeWidth="4" />
              <circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke={mode === 'work' ? 'var(--color-accent)' : 'var(--color-success)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-[96px] font-medium text-foreground tracking-tighter tabular-nums leading-none">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8">
            <button onClick={resetTimer} className="p-4 text-muted hover:text-foreground hover:bg-surface-active rounded-full transition-colors" aria-label="Reset timer">
              <RotateCcw size={24} />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className={clsx(
                'w-24 h-24 rounded-full flex items-center justify-center text-white shadow-float transition-all active:scale-95 hover:scale-105',
                mode === 'work' ? 'bg-accent hover:bg-accent-hover' : 'bg-success hover:bg-success-hover'
              )}
              aria-label={running ? 'Pause timer' : 'Start timer'}
            >
              {running ? <Pause size={36} /> : <Play size={36} className="ml-2" />}
            </button>
            <div className="w-[56px]" />
          </div>
        </div>

        {/* Sidebar: Tasks & Presets */}
        <div className="w-full xl:w-[400px] flex flex-col gap-6">
          
          {/* Active Task List */}
          <div className="flex-1 bg-surface rounded-[24px] border border-border shadow-xs p-6 flex flex-col">
             <div className="flex items-center justify-between mb-5">
               <h2 className="text-[14px] font-display font-semibold text-foreground flex items-center gap-2">
                  <Zap size={16} className="text-accent" />
                  My Day / Top Priorities
               </h2>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-2" style={{ scrollbarWidth: 'none' }}>
               {focusTasks.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                   <CheckCircle2 size={32} className="mb-3 opacity-20" />
                   <p className="text-[13px]">No urgent tasks.<br/>You're all caught up!</p>
                 </div>
               ) : (
                 focusTasks.map((task: any) => (
                   <div key={task._id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-surface-active border border-transparent hover:border-border transition-all cursor-pointer">
                     <button 
                        onClick={() => updateTask(task._id, { status: 'done' })}
                        className="mt-0.5 w-4 h-4 rounded-full border border-muted hover:border-accent flex shrink-0"
                     />
                     <div>
                       <p className="text-[13px] font-medium text-foreground leading-snug group-hover:text-accent transition-colors">
                         {task.title}
                       </p>
                       <p className="text-[11px] text-foreground-tertiary mt-1 flex items-center gap-1.5">
                         <span className={clsx("w-1.5 h-1.5 rounded-full", task.priority === 'urgent' ? 'bg-danger' : 'bg-warning')} />
                         {task.priority}
                       </p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* Presets */}
          <div className="bg-surface rounded-[24px] border border-border shadow-xs p-6 shrink-0">
            <h2 className="text-[13px] font-semibold text-foreground mb-4">Focus Presets</h2>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setPreset(i);
                    setMode('work');
                  }}
                  className={clsx(
                    'py-3 px-2 flex flex-col items-center justify-center rounded-xl transition-all border outline-none',
                    preset === i
                      ? 'bg-accent/10 border-accent/20 text-accent shadow-sm'
                      : 'bg-surface border-border text-foreground-secondary hover:bg-surface-active hover:text-foreground'
                  )}
                >
                  <span className="text-[11px] font-bold tracking-wide uppercase">{p.label}</span>
                  <span className="text-[14px] font-display font-semibold mt-1 tabular-nums">{p.work}m</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
