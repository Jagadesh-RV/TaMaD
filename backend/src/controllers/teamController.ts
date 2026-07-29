import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import Team from '../models/Team';
import TeamMember from '../models/TeamMember';
import Role from '../models/Role';
import Workspace from '../models/Workspace';
import TeamInvitation from '../models/TeamInvitation';
import { io } from '../index';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer';

/**
 * Helper to ensure default roles exist for a team
 */
async function ensureDefaultRoles(teamId: mongoose.Types.ObjectId) {
  const roles = [
    { name: 'Owner', teamId, isDefault: true, description: 'Full access to the team' },
    { name: 'Admin', teamId, isDefault: true, description: 'Can manage most settings' },
    { name: 'Member', teamId, isDefault: true, description: 'Can create and edit content' },
    { name: 'Viewer', teamId, isDefault: true, description: 'Read-only access' },
  ];

  const createdRoles = await Role.insertMany(roles);
  return createdRoles;
}

export const createTeam = async (req: AuthRequest, res: Response) => {
  const { name, slug, description, logoUrl, color, visibility, timeZone, workspaceName } = req.body;
  const userId = req.user?._id;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Team name and slug are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTeam = await Team.findOne({ slug }).session(session);
    if (existingTeam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Team slug already in use' });
    }

    const team = await Team.create([{
      name,
      slug,
      description,
      logoUrl,
      color,
      visibility: visibility || 'private',
      timeZone: timeZone || 'UTC',
      createdBy: userId,
    }], { session });

    const newTeam = team[0];

    const defaultRoles = await ensureDefaultRoles(newTeam._id as mongoose.Types.ObjectId);
    const ownerRole = defaultRoles.find(r => r.name === 'Owner');

    if (!ownerRole) throw new Error('Owner role could not be created');

    await TeamMember.create([{
      teamId: newTeam._id,
      userId,
      roleId: ownerRole._id,
      status: 'active',
      joinedAt: new Date(),
      lastActive: new Date(),
    }], { session });

    const defaultWorkspaceName = workspaceName || `${name} Workspace`;
    
    await Workspace.create([{
      name: defaultWorkspaceName,
      type: 'team',
      teamId: newTeam._id,
      ownerId: userId,
      members: [{ userId, role: 'owner' }],
      isActive: true,
      settings: { allowGuests: false, isPublic: false }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
};

export const getTeams = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;

  try {
    const memberships = await TeamMember.find({ userId, isDeleted: false, status: 'active' }).populate('teamId');
    const teams = memberships.map(m => m.teamId).filter(Boolean);

    res.json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, isDeleted: false });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ team });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    io.to(`team_${team._id}`).emit('team_updated', team);
    res.json({ team });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update team' });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const members = await TeamMember.find({ teamId: req.params.id, isDeleted: false })
      .populate('userId', 'name email avatarUrl')
      .populate('roleId', 'name');
    res.json({ members });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  const { email, roleId, inviteType } = req.body;
  const teamId = req.params.id;
  
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days valid

    const invite = await TeamInvitation.create({
      email,
      teamId,
      roleId,
      invitedBy: req.user?._id,
      inviteType: inviteType || 'email',
      token,
      expiresAt,
    });

    if (inviteType === 'email' || !inviteType) {
      const team = await Team.findById(teamId);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const inviteLink = `${frontendUrl}/join?token=${token}`;
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join a team!</h2>
          <p>You have been invited by <strong>${req.user?.name || 'a user'}</strong> to join the team <strong>${team?.name || 'TaMaD'}</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 12px;">If you did not expect this invitation, you can ignore this email.</p>
          <p style="color: #666; font-size: 12px;">Or copy and paste this link: ${inviteLink}</p>
        </div>
      `;

      const senderName = req.user?.name ? `${req.user.name} (via TaMaD)` : 'TaMaD App';
      const senderEmail = req.user?.email;

      await sendMail(
        email, 
        `Invitation to join ${team?.name || 'a team'} on TaMaD`, 
        emailHtml,
        senderName,
        senderEmail
      );
    }
    
    res.status(201).json({ message: 'Invitation created', invite });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const joinTeam = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  const userId = req.user?._id;

  try {
    const invite = await TeamInvitation.findOne({ token, status: 'pending' });
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    const existingMember = await TeamMember.findOne({ teamId: invite.teamId, userId });
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this team' });
    }

    await TeamMember.create({
      teamId: invite.teamId,
      userId,
      roleId: invite.roleId,
      status: 'active',
    });

    invite.status = 'accepted';
    invite.uses += 1;
    await invite.save();

    io.to(`team_${invite.teamId}`).emit('member_joined', { userId, teamId: invite.teamId });
    res.json({ message: 'Successfully joined team' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to join team' });
  }
};

export const leaveTeam = async (req: AuthRequest, res: Response) => {
  try {
    const member = await TeamMember.findOneAndUpdate(
      { teamId: req.params.id, userId: req.user?._id, isDeleted: false },
      { $set: { isDeleted: true, status: 'suspended' } }
    );
    if (!member) return res.status(404).json({ error: 'Not a member of this team' });
    
    io.to(`team_${req.params.id}`).emit('member_left', { userId: req.user?._id, teamId: req.params.id });
    res.json({ message: 'Successfully left team' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to leave team' });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.body;
    const member = await TeamMember.findOneAndUpdate(
      { teamId: req.params.id, userId: req.params.memberId, isDeleted: false },
      { $set: { roleId } },
      { new: true }
    ).populate('roleId', 'name');
    
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    io.to(`team_${req.params.id}`).emit('member_updated', { userId: req.params.memberId, teamId: req.params.id, role: member.roleId });
    res.json({ member });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update member' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const member = await TeamMember.findOneAndUpdate(
      { teamId: req.params.id, userId: req.params.memberId, isDeleted: false },
      { $set: { isDeleted: true, status: 'suspended' } }
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    io.to(`team_${req.params.id}`).emit('member_left', { userId: req.params.memberId, teamId: req.params.id });
    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
