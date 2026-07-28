import { create } from 'zustand';

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  priority: string;
  tags?: Array<{ name: string; color: string }>;
  createdAt: string;
}

interface TemplateState {
  templates: TaskTemplate[];
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
}

const STORAGE_KEY = 'tamad_task_templates';

function loadTemplates(): TaskTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: TaskTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: loadTemplates(),

  addTemplate: (template) => {
    const newTemplate: TaskTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [...get().templates, newTemplate];
    saveTemplates(next);
    set({ templates: next });
  },

  removeTemplate: (id) => {
    const next = get().templates.filter(t => t.id !== id);
    saveTemplates(next);
    set({ templates: next });
  },

  updateTemplate: (id, updates) => {
    const next = get().templates.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTemplates(next);
    set({ templates: next });
  },
}));
