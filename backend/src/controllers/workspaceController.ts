import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Workspace from '../models/Workspace';
import User from '../models/User';
import { cache, CACHE_KEYS } from '../utils/cache';
import { getIO } from '../sockets/socketManager';

export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  const workspaces = await Workspace.find({
    'members.userId': req.user._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json(workspaces);
};

export const getWorkspaceById = async (req: AuthRequest, res: Response) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.userId', 'name email avatarUrl')
    .populate('ownerId', 'name email avatarUrl');

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }


  res.json(workspace);
};

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  const { name, description, settings } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    ownerId: req.user._id,
    members: [{ userId: req.user._id, role: 'owner' }],
    settings: {
      allowGuests: settings?.allowGuests || false,
      isPublic: settings?.isPublic || false,
    },
  });

  res.status(201).json(workspace);
};

export const updateWorkspace = async (req: AuthRequest, res: Response) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }


  const { name, description, settings } = req.body;
  if (name !== undefined) workspace.name = name;
  if (description !== undefined) workspace.description = description;
  if (settings) {
    workspace.settings = { ...workspace.settings, ...settings };
  }

  await workspace.save();
  await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));
  
  getIO().to(`workspace_${workspace._id}`).emit('workspace_updated', workspace);
  
  res.json(workspace);
};

export const deleteWorkspace = async (req: AuthRequest, res: Response) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }


  workspace.isActive = false;
  await workspace.save();
  
  await cache.del(CACHE_KEYS.WORKSPACE(req.user._id));
  
  res.json({ message: 'Workspace archived' });
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const { email, role = 'member' } = req.body;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }


  if (workspace.type === 'personal') {
    return res.status(400).json({ error: 'Personal workspaces cannot be shared. Please create a Team workspace.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found with this email' });
  }

  const alreadyMember = workspace.members.some(
    (m: any) => m.userId.toString() === user._id.toString()
  );

  if (alreadyMember) {
    return res.status(400).json({ error: 'User is already a member' });
  }

  workspace.members.push({ userId: user._id, role: role as any });
  await workspace.save();

  getIO().to(`workspace_${workspace._id}`).emit('member_added', {
    userId: user._id,
    name: user.name,
    email: user.email,
    role,
  });

  res.json(workspace);
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  const { userId, role } = req.body;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }


  if (userId === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  const memberIndex = workspace.members.findIndex(
    (m: any) => m.userId.toString() === userId
  );

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  workspace.members[memberIndex].role = role;
  await workspace.save();

  getIO().to(`workspace_${workspace._id}`).emit('member_role_updated', { userId, role });

  res.json(workspace);
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const targetEntry = workspace.members.find(
    (m: any) => m.userId.toString() === userId
  );

  if (targetEntry?.role === 'owner') {
    return res.status(400).json({ error: 'Cannot remove the workspace owner' });
  }

  workspace.members = workspace.members.filter(
    (m: any) => m.userId.toString() !== userId
  );

  await workspace.save();

  getIO().to(`workspace_${workspace._id}`).emit('member_removed', { userId });

  res.json(workspace);
};

export const getWorkspaceStats = async (req: AuthRequest, res: Response) => {
  const workspaceId = req.params.id;
  
  const workspace = req.workspace;

  const Task = (await import('../models/Task')).default;
  const Project = (await import('../models/Project')).default;
  const Note = (await import('../models/Note')).default;

  const [tasks, projects, notes] = await Promise.all([
    Task.countDocuments({ workspaceId }),
    Project.countDocuments({ workspaceId }),
    Note.countDocuments({ workspaceId }),
  ]);

  res.json({
    members: workspace.members.length,
    tasks,
    projects,
    notes,
  });
};
