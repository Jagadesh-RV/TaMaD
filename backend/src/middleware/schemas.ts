import { z } from 'zod';

const taskStatusEnum = z.enum(['todo', 'in-progress', 'review', 'done']);
const taskPriorityEnum = z.enum(['urgent', 'high', 'medium', 'low']);

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  workspaceId: z.string(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200).default('Untitled'),
  content: z.string().optional(),
  workspaceId: z.string(),
});

export const noteUpdateSchema = noteCreateSchema.partial();

export const whiteboardCreateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  workspaceId: z.string(),
});

export const whiteboardUpdateSchema = whiteboardCreateSchema.partial();

export const goalCreateSchema = z.object({
  title: z.string().min(1).max(200),
  workspaceId: z.string(),
});

export const habitCreateSchema = z.object({
  name: z.string().min(1).max(100),
  workspaceId: z.string(),
});
