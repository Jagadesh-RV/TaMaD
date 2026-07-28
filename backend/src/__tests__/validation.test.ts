import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  taskCreateSchema,
  projectCreateSchema,
  noteCreateSchema,
} from '../middleware/schemas';

describe('taskCreateSchema', () => {
  it('accepts valid data', () => {
    const data = { title: 'My Task', workspaceId: 'w1', status: 'todo', priority: 'high' };
    expect(taskCreateSchema.parse(data)).toEqual(data);
  });

  it('accepts data with only required fields', () => {
    const data = { title: 'Task', workspaceId: 'w1' };
    expect(taskCreateSchema.parse(data)).toEqual(data);
  });

  it('rejects missing title', () => {
    expect(() => taskCreateSchema.parse({ workspaceId: 'w1' })).toThrow(ZodError);
  });

  it('rejects empty title', () => {
    expect(() => taskCreateSchema.parse({ title: '', workspaceId: 'w1' })).toThrow(ZodError);
  });

  it('rejects missing workspaceId', () => {
    expect(() => taskCreateSchema.parse({ title: 'Task' })).toThrow(ZodError);
  });

  it('rejects invalid status enum', () => {
    expect(() =>
      taskCreateSchema.parse({ title: 'Task', workspaceId: 'w1', status: 'invalid-status' })
    ).toThrow(ZodError);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['todo', 'in-progress', 'review', 'done']) {
      const result = taskCreateSchema.parse({ title: 'Task', workspaceId: 'w1', status });
      expect(result.status).toBe(status);
    }
  });
});

describe('projectCreateSchema', () => {
  it('accepts valid data', () => {
    const data = { name: 'Project', workspaceId: 'w1' };
    expect(projectCreateSchema.parse(data)).toEqual(data);
  });

  it('accepts data with description', () => {
    const data = { name: 'Project', workspaceId: 'w1', description: 'A project' };
    expect(projectCreateSchema.parse(data)).toEqual(data);
  });

  it('rejects empty name', () => {
    expect(() => projectCreateSchema.parse({ name: '', workspaceId: 'w1' })).toThrow(ZodError);
  });

  it('rejects missing name', () => {
    expect(() => projectCreateSchema.parse({ workspaceId: 'w1' })).toThrow(ZodError);
  });

  it('rejects missing workspaceId', () => {
    expect(() => projectCreateSchema.parse({ name: 'Project' })).toThrow(ZodError);
  });
});

describe('noteCreateSchema', () => {
  it('accepts valid data', () => {
    const data = { title: 'Note', workspaceId: 'w1' };
    expect(noteCreateSchema.parse(data)).toEqual(data);
  });

  it('defaults title to Untitled when not provided', () => {
    const result = noteCreateSchema.parse({ workspaceId: 'w1' });
    expect(result.title).toBe('Untitled');
  });

  it('accepts data with content', () => {
    const data = { title: 'Note', content: 'Some content', workspaceId: 'w1' };
    expect(noteCreateSchema.parse(data)).toEqual(data);
  });

  it('rejects missing workspaceId', () => {
    expect(() => noteCreateSchema.parse({ title: 'Note' })).toThrow(ZodError);
  });
});
