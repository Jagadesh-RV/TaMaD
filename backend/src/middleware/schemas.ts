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

export const habitUpdateSchema = habitCreateSchema.partial();

export const portfolioCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
});

export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export const milestoneCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  projectId: z.string(),
  dueDate: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  workspaceId: z.string(),
});

export const milestoneUpdateSchema = milestoneCreateSchema.partial();

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  workspaceId: z.string(),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  workspaceId: z.string(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  settings: z.object({
    allowGuests: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  }).optional(),
});

export const workspaceUpdateSchema = workspaceCreateSchema.partial();
