import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Organization from '../models/Organization';

// Create a new Organization
export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, domain, logoUrl } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Organization name is required' });
      return;
    }

    const organization = new Organization({
      name,
      domain,
      logoUrl,
      ownerId: userId,
      members: [{ userId, role: 'owner' }],
      billing: { plan: 'free', status: 'active' },
    });

    await organization.save();

    res.status(201).json(organization);
  } catch (_error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

// Get all Organizations the user belongs to
export const getMyOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const organizations = await Organization.find({
      'members.userId': userId,
      isActive: true,
    }).populate('members.userId', 'name email avatarUrl');

    res.status(200).json(organizations);
  } catch (_error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

// Get a specific Organization
export const getOrganizationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const organization = await Organization.findOne({ _id: id, isActive: true })
      .populate('members.userId', 'name email avatarUrl');

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    // Check if user is a member
    const isMember = organization.members.some((m) => m.userId._id.toString() === userId.toString());
    if (!isMember) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(200).json(organization);
  } catch (_error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

// Update Organization
export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, domain, logoUrl } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    // Must be owner or admin
    const member = organization.members.find((m) => m.userId.toString() === userId.toString());
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (name) organization.name = name;
    if (domain !== undefined) organization.domain = domain;
    if (logoUrl !== undefined) organization.logoUrl = logoUrl;

    await organization.save();

    res.status(200).json(organization);
  } catch (_error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};
