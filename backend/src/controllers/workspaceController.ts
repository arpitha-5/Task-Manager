import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Workspace from '../models/Workspace';
import User from '../models/User';

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user!._id,
      members: [{ user: req.user!._id, role: 'owner' }]
    });

    // Add workspace to user
    await User.findByIdAndUpdate(req.user!._id, {
      $push: { workspaces: workspace._id },
      currentWorkspace: workspace._id
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all workspaces for user
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user!._id });
    res.status(200).json({ success: true, count: workspaces.length, data: workspaces });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Switch current workspace
// @route   PUT /api/workspaces/switch/:id
// @access  Private
export const switchWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Check if user is member
    const isMember = workspace.members.some(m => m.user.toString() === req.user!._id.toString());
    if (!isMember) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this workspace' });
    }

    await User.findByIdAndUpdate(req.user!._id, { currentWorkspace: workspace._id });

    res.status(200).json({ success: true, data: workspace });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite member to workspace
// @route   POST /api/workspaces/:id/invite
// @access  Private (Admin/Owner)
export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Find user by email
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already member
    if (workspace.members.some(m => m.user.toString() === userToInvite._id.toString())) {
      return res.status(400).json({ success: false, message: 'User already a member' });
    }

    workspace.members.push({ user: userToInvite._id as any, role: role || 'member' });
    await workspace.save();

    userToInvite.workspaces.push(workspace._id as any);
    await userToInvite.save();

    res.status(200).json({ success: true, message: 'User invited successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
