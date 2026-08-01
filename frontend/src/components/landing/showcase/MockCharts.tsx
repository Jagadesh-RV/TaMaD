import type { ReactNode } from 'react';
import { useId } from 'react';
import clsx from 'clsx';
import { palette } from './MockChrome';

export function MiniAreaChart({ className }: { className?: string }) {
  const gradientId = useId();
  const points = [18, 34, 28, 52, 44, 68, 58, 82, 74, 96, 88, 100];
  const w = 300;
  const h = 110;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - (p / 100) * h] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={clsx('h-full w-full', className)} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.blue} stopOpacity="0.28" />
          <stop offset="100%" stopColor={palette.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={h * f} x2={w} y2={h * f} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={palette.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[points.length - 1][0]} cy={coords[points.length - 1][1]} r="3.5" fill={palette.blue} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export function MiniBarChart({ className }: { className?: string }) {
  const bars = [38, 62, 45, 78, 55, 90, 70, 96, 58, 82, 64, 88];
  return (
    <div className={clsx('flex h-full items-end gap-1.5', className)} aria-hidden="true">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${height}%`,
            background: i === bars.length - 1 ? palette.blue : '#dbeafe',
          }}
        />
      ))}
    </div>
  );
}

export function MiniPieChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={clsx('h-full w-full', className)} aria-hidden="true">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef2f7" strokeWidth="6" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke={palette.blue} strokeWidth="6" strokeDasharray="42 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke={palette.emerald} strokeWidth="6" strokeDasharray="26 100" strokeDashoffset="-42" strokeLinecap="round" transform="rotate(-90 18 18)" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke={palette.amber} strokeWidth="6" strokeDasharray="14 100" strokeDashoffset="-68" strokeLinecap="round" transform="rotate(-90 18 18)" />
    </svg>
  );
}

export function MockLegend({ items }: { items: { label: string; color: string; value: string }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
          <span className="text-[10px] font-bold text-slate-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MockStatCard({
  label,
  value,
  delta,
  up = true,
  accent = palette.blue,
  children,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span
          className="rounded-md px-1 py-0.5 text-[9px] font-bold"
          style={{ background: up ? '#ecfdf5' : '#fef2f2', color: up ? palette.emerald : palette.rose }}
        >
          {delta}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-lg font-extrabold tracking-tight text-slate-800">{value}</span>
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
      </div>
      {children}
    </div>
  );
}
