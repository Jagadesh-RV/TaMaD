import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { BurndownWidget, VelocityWidget, WorkloadWidget, ActiveSprintWidget } from './DashboardWidgets';
import { DashboardWidget } from '../../store/dashboardStore';

const widgetComponents: Record<string, React.FC> = {
  'active-sprint': ActiveSprintWidget,
  'burndown': BurndownWidget,
  'velocity': VelocityWidget,
  'workload': WorkloadWidget,
};

interface SortableWidgetProps {
  widget: DashboardWidget;
  isEditing: boolean;
}

const SortableWidget = ({ widget, isEditing }: SortableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    gridColumn: `span ${widget.w}`,
    gridRow: `span ${widget.h}`,
  };

  const WidgetComponent = widgetComponents[widget.type];

  if (!widget.visible && !isEditing) return null;

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${!widget.visible ? 'opacity-50 grayscale' : ''}`}>
      {isEditing && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 right-2 p-1 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded shadow-sm cursor-grab z-20 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
        >
          <GripHorizontal size={16} />
        </div>
      )}
      {WidgetComponent ? <WidgetComponent /> : <div className="p-4 bg-red-100 rounded">Unknown Widget</div>}
    </div>
  );
};

interface DashboardWidgetEngineProps {
  layout: DashboardWidget[];
  onChange: (layout: DashboardWidget[]) => void;
  isEditing: boolean;
}

export default function DashboardWidgetEngine({ layout, onChange, isEditing }: DashboardWidgetEngineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = layout.findIndex(item => item.id === active.id);
      const newIndex = layout.findIndex(item => item.id === over.id);
      onChange(arrayMove(layout, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={layout.map(w => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[160px]">
          {layout.map((widget) => (
            <SortableWidget key={widget.id} widget={widget} isEditing={isEditing} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
