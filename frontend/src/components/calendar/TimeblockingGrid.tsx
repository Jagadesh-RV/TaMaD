import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, parseISO, isSameDay, getHours, getMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { Calendar as CalendarIcon } from 'lucide-react';

interface TimeblockingGridProps {
  weekDays: Date[];
  tasks: any[];
  meetings: any[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function TimeSlot({ day, hour, isCurrentHour }: { day: Date; hour: number; isCurrentHour: boolean }) {
  // We use a specific ID format so the parent can parse it
  // e.g. "2023-10-05T14:00"
  const dateStr = format(day, 'yyyy-MM-dd');
  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
  const dropId = `${dateStr}T${timeStr}`;

  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'h-[60px] border-b border-r transition-colors',
      )}
      style={{
        borderColor: 'var(--color-border-light)',
        background: isOver ? 'var(--color-accent-light)' : 'transparent'
      }}
    />
  );
}

function EventBlock({ event, type }: { event: any; type: 'task' | 'meeting' }) {
  // event.startDate or event.dueDate for task, event.startTime for meeting
  const startField = type === 'meeting' ? event.startTime : (event.startDate || event.dueDate);
  const endField = type === 'meeting' ? event.endTime : event.dueDate;
  
  if (!startField) return null;

  try {
    const start = parseISO(startField);
    const end = endField ? parseISO(endField) : new Date(start.getTime() + 60 * 60 * 1000); // default 1h
    
    const startHour = getHours(start);
    const startMin = getMinutes(start);
    
    // Calculate top offset (1 hour = 60px)
    const topPx = (startHour * 60) + startMin;
    
    // Calculate height (min 30px)
    const durationMins = Math.max(30, differenceInMinutes(end, start));
    const heightPx = durationMins;

    const bgColor = type === 'meeting' ? 'var(--color-primary-light, #e0f2fe)' : 'var(--color-surface-hover)';
    const color = type === 'meeting' ? 'var(--color-primary-800, #075985)' : 'var(--color-foreground)';
    const borderColor = type === 'meeting' ? 'var(--color-primary, #0ea5e9)' : 'var(--color-border)';

    return (
      <div
        className="absolute left-1 right-1 rounded-md px-2 py-1 text-[10px] font-medium overflow-hidden shadow-sm border-l-[3px]"
        style={{
          top: `${topPx}px`,
          height: `${heightPx}px`,
          background: bgColor,
          color: color,
          borderColor: borderColor,
          zIndex: 10
        }}
        title={event.title}
      >
        <div className="font-semibold truncate">{event.title}</div>
        <div className="text-[9px] opacity-80 truncate">{format(start, 'h:mm a')}</div>
      </div>
    );
  } catch (e) {
    return null;
  }
}

export default function TimeblockingGrid({ weekDays, tasks, meetings }: TimeblockingGridProps) {
  // Current time line calculation
  const now = new Date();
  const currentHour = getHours(now);
  const currentMinute = getMinutes(now);
  const currentTimeTop = (currentHour * 60) + currentMinute;

  return (
    <div className="flex flex-1 flex-col rounded-2xl border overflow-hidden bg-[color:var(--color-surface)] shadow-[var(--shadow-xs)] border-[color:var(--color-border)]">
      <div className="flex-1 overflow-x-auto flex flex-col" style={{ scrollbarWidth: 'thin' }}>
        <div className="min-w-[700px] flex flex-col flex-1">
          {/* Week Days Header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[color:var(--color-border)] sticky top-0 bg-[color:var(--color-surface)] z-20">
            <div className="border-r border-[color:var(--color-border)]" />
            {weekDays.map(day => (
              <div key={day.toISOString()} className="py-3 flex flex-col items-center justify-center border-r border-[color:var(--color-border-light)]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">
                  {format(day, 'EEE')}
                </span>
                <span className={clsx(
                  'mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-bold',
                  isSameDay(day, now) ? 'bg-[color:var(--color-accent)] text-white' : 'text-[color:var(--color-foreground)]'
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Scrollable Time Grid */}
          <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-[60px_repeat(7,1fr)] relative min-h-[1440px]">
          
          {/* Time Labels Column */}
          <div className="flex flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] relative z-10">
            {HOURS.map(hour => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-[color:var(--color-muted)]">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map(day => {
            const isToday = isSameDay(day, now);
            
            // Filter events for this day
            const dayTasks = tasks.filter(t => {
              if (!t.startDate && !t.dueDate) return false;
              try {
                return isSameDay(parseISO(t.startDate || t.dueDate), day);
              } catch { return false; }
            });

            const dayMeetings = meetings.filter(m => {
              if (!m.startTime) return false;
              try {
                return isSameDay(parseISO(m.startTime), day);
              } catch { return false; }
            });

            return (
              <div key={day.toISOString()} className="relative border-r border-[color:var(--color-border-light)]">
                {HOURS.map(hour => (
                  <TimeSlot key={hour} day={day} hour={hour} isCurrentHour={isToday && currentHour === hour} />
                ))}

                {/* Events overlay */}
                {dayMeetings.map(m => <EventBlock key={`m-${m._id}`} event={m} type="meeting" />)}
                {dayTasks.map(t => <EventBlock key={`t-${t._id}`} event={t} type="task" />)}

                {/* Current Time Indicator */}
                {isToday && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-[color:var(--color-danger)] z-20 pointer-events-none"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[color:var(--color-danger)]" />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
