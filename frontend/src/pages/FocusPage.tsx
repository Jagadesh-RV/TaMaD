import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long', work: 50, break: 10 },
  { label: 'Short', work: 15, break: 3 },
];

export default function FocusPage() {
  const [preset, setPreset] = useState(0);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [minutes, setMinutes] = useState(PRESETS[0].work);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<string | null>(null);
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';

  // Load today's session count
  useEffect(() => {
    if (!workspaceId) return;
    api.get('/focus-sessions/stats', { params: { workspaceId } })
      .then(({ data }) => setCompleted(data.todaySessions || 0))
      .catch(() => {});
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
      }, 1000);
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
      toast.success('Focus session complete! Take a break.', { duration: 4000 });
      if (Notification.permission === 'granted') new Notification('TaMaD', { body: 'Focus session done! Take a break.' });
      // Persist session to backend
      if (workspaceId) {
        api.post('/focus-sessions', {
          workspaceId,
          preset: PRESETS[preset].label,
          durationMinutes: PRESETS[preset].work,
        }).then(({ data }) => { sessionRef.current = data._id; })
          .then(() => {
            if (sessionRef.current) {
              api.put(`/focus-sessions/${sessionRef.current}/complete`).catch(() => {});
            }
          })
          .catch(() => {});
      }
      setMode('break');
    } else {
      toast.success('Break over! Time to focus.', { duration: 3000 });
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
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="page-title mb-0 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl text-yellow-500">
              <Zap size={24} className="fill-yellow-500" />
            </div>
            Focus Mode
          </h1>
          <p className="text-secondary mt-2 text-sm">Deep work with the Pomodoro technique</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium shadow-sm border border-green-100">
          <CheckCircle2 size={18} />
          {completed} sessions today
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Timer Section */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className={clsx("absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 -z-10", mode === 'work' ? 'bg-blue-400' : 'bg-green-400')} />

          {/* Mode Toggle */}
          <div className="flex bg-gray-100/80 p-1 rounded-full mb-12 shadow-inner border border-gray-200/50">
            {['work', 'break'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as 'work' | 'break')}
                className={clsx(
                  'px-8 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300',
                  mode === m
                    ? (m === 'work' ? 'bg-blue-600 text-white shadow-md' : 'bg-green-500 text-white shadow-md')
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* SVG Timer */}
          <div className="relative w-72 h-72 mb-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke={mode === 'work' ? '#2563eb' : '#22c55e'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-7xl font-bold text-gray-800 tracking-tighter">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button onClick={resetTimer} className="p-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <RotateCcw size={24} />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className={clsx(
                'w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 hover:scale-105',
                mode === 'work' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
              )}
            >
              {running ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <div className="w-14" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[360px] flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Timer Presets</h2>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setPreset(i);
                    setMode('work');
                  }}
                  className={clsx(
                    'py-3 flex flex-col items-center justify-center rounded-2xl transition-all border',
                    preset === i
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10px] mt-1 opacity-80">{p.work}m</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 flex flex-col justify-center">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Zap size={16} /> Focus Tips
            </h3>
            <ul className="text-sm text-blue-800/80 space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Close all unnecessary browser tabs and mute notifications.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Put your phone in another room or face down.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Focus on ONE specific task during the work block.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Stand up and stretch during your break.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}