// @ts-nocheck
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import '../models/User';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';
import { verifyWorkspaceMembership } from '../middleware/workspaceAuth';

// @desc    Get all projects for a workspace
// @route   GET /api/projects?workspaceId=...
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const cacheKey = CACHE_KEYS.PROJECTS(workspaceId as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await cache.get<any>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const projects = await Project.find({ workspaceId, isArchived: false })
    .populate('members.userId', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  await cache.set(cacheKey, projects, CACHE_TTL.PROJECTS);
  res.json(projects);
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, workspaceId, portfolioId, startDate, endDate, health, risks, dependencies, agileSettings } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const project = await Project.create({
    name,
    description,
    workspaceId,
    portfolioId,
    startDate,
    endDate,
    health: health || 'on-track',
    risks: risks || [],
    dependencies: dependencies || [],
    agileSettings: agileSettings || { methodology: 'scrum', sprintLengthDays: 14 },
    createdBy: req.user._id,
    members: [{ userId: req.user._id, role: 'manager' }],
  });

  await cache.invalidatePattern(CACHE_KEYS.PROJECTS(workspaceId));

  res.status(201).json(project);
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const isMember = await verifyWorkspaceMembership(project.workspaceId.toString(), req.user._id);
  if (!isMember) {
    return res.status(403).json({ error: 'Not authorized to update this project' });
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('members.userId', 'name email avatarUrl');

  await cache.invalidatePattern(CACHE_KEYS.PROJECTS(project.workspaceId.toString()));

  res.json(updatedProject);
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const isMember = await verifyWorkspaceMembership(project.workspaceId.toString(), req.user._id);
  if (!isMember) {
    return res.status(403).json({ error: 'Not authorized to delete this project' });
  }

  await project.deleteOne();
  
  await cache.invalidatePattern(CACHE_KEYS.PROJECTS(project.workspaceId.toString()));
  
  res.json({ message: 'Project removed' });
};
