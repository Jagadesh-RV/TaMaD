import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const BurndownWidget = () => {
  const data = [
    { day: 'Mon', ideal: 100, actual: 100 },
    { day: 'Tue', ideal: 80, actual: 85 },
    { day: 'Wed', ideal: 60, actual: 65 },
    { day: 'Thu', ideal: 40, actual: 30 },
    { day: 'Fri', ideal: 20, actual: 20 },
    { day: 'Sat', ideal: 0, actual: 5 },
  ];
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[color:var(--color-surface)] border border-[color:var(--color-border-light)] rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-4">Sprint Burndown</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis dataKey="day" stroke="var(--color-muted)" fontSize={12} />
            <YAxis stroke="var(--color-muted)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }} />
            <Line type="monotone" dataKey="ideal" stroke="var(--color-muted)" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="actual" stroke="var(--color-accent)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const VelocityWidget = () => {
  const data = [
    { sprint: 'Sprint 1', points: 30 },
    { sprint: 'Sprint 2', points: 45 },
    { sprint: 'Sprint 3', points: 38 },
    { sprint: 'Sprint 4', points: 50 },
    { sprint: 'Sprint 5', points: 42 },
  ];
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[color:var(--color-surface)] border border-[color:var(--color-border-light)] rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-4">Team Velocity</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis dataKey="sprint" stroke="var(--color-muted)" fontSize={12} />
            <YAxis stroke="var(--color-muted)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }} />
            <Bar dataKey="points" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const WorkloadWidget = () => {
  const data = [
    { name: 'Alex', tasks: 12 },
    { name: 'Sam', tasks: 8 },
    { name: 'Taylor', tasks: 15 },
    { name: 'Jordan', tasks: 5 },
  ];
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[color:var(--color-surface)] border border-[color:var(--color-border-light)] rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-4">Workload Distribution</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="tasks"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ActiveSprintWidget = () => {
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[color:var(--color-surface)] border border-[color:var(--color-border-light)] rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-4">Active Sprint Progress</h3>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-[color:var(--color-foreground)]">65%</span>
          <span className="text-sm font-medium text-[color:var(--color-muted)]">3 days remaining</span>
        </div>
        <div className="w-full h-3 bg-[color:var(--color-surface-hover)] rounded-full overflow-hidden">
          <div className="h-full bg-[color:var(--color-accent)]" style={{ width: '65%' }}></div>
        </div>
        <div className="mt-4 flex justify-between text-xs text-[color:var(--color-muted)]">
          <span>42/65 pts completed</span>
          <span>12 issues open</span>
        </div>
      </div>
    </div>
  );
};
