import React, { ReactNode } from 'react';

// Badge Component Variants
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'solid' | 'outline' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'default', size = 'md', ...props }: BadgeProps) {
  const baseClass = 'inline-flex items-center gap-1 font-semibold text-center whitespace-nowrap';

  const sizeClass = {
    sm: 'px-2 py-1 text-xs rounded-full',
    md: 'px-3 py-1.5 text-sm rounded-lg',
    lg: 'px-4 py-2 text-base rounded-xl',
  }[size];

  const variantClass = {
    default: 'bg-white/10 text-white border border-white/20',
    solid: 'bg-brand text-white',
    outline: 'bg-transparent border-2 border-brand text-brand',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  }[variant];

  return (
    <span className={`${baseClass} ${sizeClass} ${variantClass}`} {...props}>
      {children}
    </span>
  );
}

// Card Component with Variants
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'glass' | 'default' | 'gradient' | 'neon' | 'minimal';
  className?: string;
}

export function Card({ children, variant = 'glass', className = '', ...props }: CardProps) {
  const variantClass = {
    glass: 'card-glass',
    default: 'card',
    gradient: 'card-gradient',
    neon: 'card-neon',
    minimal: 'card-minimal',
  }[variant];

  return (
    <div className={`${variantClass} rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Button Component with Variants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold transition-all';

  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size];

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    text: 'btn-text',
  }[variant];

  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Color Swatch Component
interface ColorSwatchProps {
  color: string;
  label?: string;
  code?: string;
}

export function ColorSwatch({ color, label, code }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border border-white/10 shadow-md"
        style={{ backgroundColor: color }}
      />
      <div>
        {label && <p className="text-sm font-medium text-white">{label}</p>}
        {code && <p className="text-xs text-slate-500">{code}</p>}
      </div>
    </div>
  );
}

// Grid Layout Component
interface DesignGridProps {
  children: ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function DesignGrid({ children, columns = 3, gap = 'md' }: DesignGridProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }[gap];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} ${gapClass}`}>
      {children}
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'done' | 'in_progress' | 'todo' | 'cancelled';
  icon?: React.ElementType;
}

export function StatusBadge({ status, icon: Icon }: StatusBadgeProps) {
  const statusClass = {
    done: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'in_progress': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    todo: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
  }[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusClass}`}>
      {Icon && <Icon size={14} />}
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </div>
  );
}

// Priority Badge Component
interface PriorityBadgeProps {
  priority: string;
  icon?: React.ElementType;
}

export function PriorityBadge({ priority, icon: Icon }: PriorityBadgeProps) {
  const priorityClass: Record<string, string> = {
    low: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    urgent: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  const pClass = priorityClass[priority?.toLowerCase()] || 'bg-slate-500/20 text-slate-300';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${pClass}`}>
      {Icon && <Icon size={14} />}
      <span className="capitalize">{priority}</span>
    </div>
  );
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: 'brand' | 'emerald' | 'red' | 'amber' | 'blue';
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, color = 'brand', sub }: StatCardProps) {
  const colorClass = {
    brand: 'bg-brand',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  }[color];

  return (
    <Card variant="glass">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          {Icon && <Icon size={20} className="text-white" />}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </Card>
  );
}

// Gradient Text Component
interface GradientTextProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function GradientText({ children, variant = 'primary', className = '' }: GradientTextProps) {
  const variantClass = {
    primary: 'gradient-text',
    secondary: 'gradient-text-secondary',
  }[variant];

  return <span className={`${variantClass} ${className}`}>{children}</span>;
}

// Divider Component
interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  if (text) {
    return (
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-sm text-slate-500">{text}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }
  return <div className="my-6 h-px bg-white/10" />;
}

// Info Box Component
interface InfoBoxProps {
  title?: string;
  children: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function InfoBox({ title, children, type = 'info' }: InfoBoxProps) {
  const typeClass = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  }[type];

  return (
    <div className={`${typeClass} border rounded-lg p-4`}>
      {title && <p className="font-semibold mb-2">{title}</p>}
      <p className="text-sm">{children}</p>
    </div>
  );
}

// Layout Wrapper Component
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, size = 'lg' }: ContainerProps) {
  const sizeClass = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <div className={`${sizeClass} mx-auto px-4 md:px-6 lg:px-8`}>
      {children}
    </div>
  );
}

export default {
  Badge,
  Button,
  Card,
  ColorSwatch,
  DesignGrid,
  StatusBadge,
  PriorityBadge,
  SectionHeader,
  StatCard,
  GradientText,
  Divider,
  InfoBox,
  Container,
};
