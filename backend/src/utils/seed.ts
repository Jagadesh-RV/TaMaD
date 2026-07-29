import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Project from '../models/Project';
import Task from '../models/Task';
import logger from './logger';

async function createDefaultUser(): Promise<mongoose.Types.ObjectId> {
  const existing = await User.findOne({ email: 'admin@tamad.app' });
  if (existing) {
    logger.info('Default admin user already exists');
    return existing._id as mongoose.Types.ObjectId;
  }

  const user = await User.create({
    name: 'Admin User',
    email: 'admin@tamad.app',
    firebaseUid: 'seed-admin-user',
    authProvider: 'email',
    emailVerified: true,
    role: 'admin',
    isActive: true,
    preferences: { theme: 'light', language: 'en', timezone: 'UTC' },
  });

  logger.info(`Created default admin user: ${user._id}`);
  return user._id as mongoose.Types.ObjectId;
}

async function createDefaultWorkspace(adminId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId> {
  const existing = await Workspace.findOne({ name: 'My Workspace' });
  if (existing) {
    logger.info('Default workspace already exists');
    return existing._id as mongoose.Types.ObjectId;
  }

  const workspace = await Workspace.create({
    name: 'My Workspace',
    description: 'Default workspace for getting started',
    ownerId: adminId,
    members: [{ userId: adminId, role: 'admin' }],
    settings: { allowGuests: false, isPublic: false },
  });

  logger.info(`Created default workspace: ${workspace._id}`);
  return workspace._id as mongoose.Types.ObjectId;
}

async function createSampleProject(
  workspaceId: mongoose.Types.ObjectId,
  adminId: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId> {
  const existing = await Project.findOne({ workspaceId, name: 'Getting Started' });
  if (existing) {
    logger.info('Sample project already exists');
    return existing._id as mongoose.Types.ObjectId;
  }

  const project = await Project.create({
    name: 'Getting Started',
    description: 'A sample project to help you learn TaMaD features',
    workspaceId,
    status: 'active',
    members: [{ userId: adminId, role: 'manager' }],
    createdBy: adminId,
  });

  logger.info(`Created sample project: ${project._id}`);
  return project._id as mongoose.Types.ObjectId;
}

async function createSampleTasks(
  workspaceId: mongoose.Types.ObjectId,
  projectId: mongoose.Types.ObjectId,
  adminId: mongoose.Types.ObjectId
): Promise<void> {
  const existingCount = await Task.countDocuments({ workspaceId });
  if (existingCount > 0) {
    logger.info(`Sample tasks already exist (${existingCount} found)`);
    return;
  }

  const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const tasks = [
    { title: 'Set up your profile', description: 'Add your name, avatar, and preferences', status: 'done' as const, priority: 'medium' as const },
    { title: 'Invite team members', description: 'Add your team to the workspace', status: 'todo' as const, priority: 'high' as const },
    { title: 'Create your first project', description: 'Organize work into projects', status: 'done' as const, priority: 'medium' as const },
    { title: 'Explore AI assistant', description: 'Try asking the AI to summarize your tasks', status: 'in-progress' as const, priority: 'low' as const },
    { title: 'Set up habits', description: 'Track daily habits to build routines', status: 'todo' as const, priority: 'low' as const },
    { title: 'Define goals for this quarter', description: 'Set SMART goals with milestones', status: 'todo' as const, priority: 'high' as const, dueDate: daysFromNow(14) },
    { title: 'Review project milestones', description: 'Check and update project milestones', status: 'review' as const, priority: 'medium' as const, dueDate: daysFromNow(3) },
    { title: 'Complete onboarding', description: 'Finish all onboarding steps', status: 'in-progress' as const, priority: 'high' as const },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await Task.create({
      ...tasks[i],
      workspaceId,
      projectId: i < 4 ? projectId : undefined,
      assignees: [adminId],
      createdBy: adminId,
      order: i,
      dueDate: (tasks[i] as { dueDate?: Date }).dueDate || (i % 2 === 0 ? undefined : daysFromNow(i * 2)),
    });
  }

  logger.info(`Created ${tasks.length} sample tasks`);
}

export async function seedDatabase(): Promise<void> {
  logger.info('Starting database seed...');

  try {
    const adminId = await createDefaultUser();
    const workspaceId = await createDefaultWorkspace(adminId);
    const projectId = await createSampleProject(workspaceId, adminId);
    await createSampleTasks(workspaceId, projectId, adminId);

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}
