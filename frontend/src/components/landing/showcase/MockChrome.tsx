import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

const palette = {
  blue: '#2563eb',
  indigo: '#6366f1',
  cyan: '#0891b2',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  violet: '#7c3aed',
  slate: '#64748b',
};

export function MockAvatar({
  initials,
  color = palette.blue,
  size = 22,
  className,
}: {
  initials?: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', className)}
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {initials ?? ''}
    </span>
  );
}

export function MockBar({
  width,
  height = 8,
  color = '#cbd5e1',
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={clsx('inline-block shrink-0 rounded-full', className)}
      style={{ width: width ?? '100%', height, background: color, ...style }}
    />
  );
}

export function MockPill({
  children,
  color = palette.slate,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold', className)}
      style={{ background: `${color}1a`, color }}
    >
      {children}
    </span>
  );
}

export function MockProgress({ value = 50, color = palette.blue }: { value?: number; color?: string }) {
  return (
    <span className="inline-flex h-1 w-full overflow-hidden rounded-full bg-slate-200">
      <span className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </span>
  );
}

export function MockDot({ color = palette.slate }: { color?: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />;
}

export function MockCheckbox({ checked = false, color = palette.blue }: { checked?: boolean; color?: string }) {
  return (
    <span
      className={clsx('inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border', checked && 'border-transparent')}
      style={{
        borderColor: checked ? color : '#cbd5e1',
        background: checked ? color : 'transparent',
      }}
    >
      {checked && <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none"><path d="M1.5 5.5L4 8L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

export function MockCard({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={clsx('rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]', className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function MockSidebar({
  active = 0,
  items = ['dashboard', 'tasks', 'calendar', 'projects', 'notes'],
}: {
  active?: number;
  items?: string[];
}) {
  return (
    <div className="flex h-full w-12 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white py-2">
      <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
        <div className="h-3 w-3 rounded-full bg-white/80" />
      </div>
      {items.map((item, index) => (
        <div
          key={item}
          className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', index === active ? 'bg-blue-50' : '')}
        >
          <div
            className="h-2.5 w-2.5 rounded-md"
            style={{ background: index === active ? palette.blue : '#cbd5e1' }}
          />
        </div>
      ))}
    </div>
  );
}

export function MockTopbar({ title = 'Dashboard', action = true }: { title?: string; action?: boolean }) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3">
      <span className="text-[10px] font-bold text-slate-700">{title}</span>
      {action && <div className="h-4 w-14 rounded-full bg-slate-200" />}
    </div>
  );
}

export { palette };
