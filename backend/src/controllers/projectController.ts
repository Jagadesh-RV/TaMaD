import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import '../models/User';

// @desc    Get all projects for a workspace
// @route   GET /api/projects?workspaceId=...
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const projects = await Project.find({ workspaceId, isArchived: false })
    .populate('members.userId', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.json(projects);
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, workspaceId, portfolioId, startDate, endDate } = req.body;

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
    createdBy: req.user._id,
    members: [{ userId: req.user._id, role: 'manager' }],
  });

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

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('members.userId', 'name email avatarUrl');

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

  await project.deleteOne();
  res.json({ message: 'Project removed' });
};
