import { Request, Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';
import { sendTokenResponse } from '../utils/auth';
import jwt from 'jsonwebtoken';

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    // Create initial personal workspace
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }]
    });

    user.workspaces.push(workspace._id as any);
    user.currentWorkspace = workspace._id as any;
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      console.log('User not found for email:', normalizedEmail);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req: Request, res: Response) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
