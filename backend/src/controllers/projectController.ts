import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, deadline, color } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user!._id,
      category,
      deadline: deadline || new Date(),
      color: color || '#3b82f6',
      members: [req.user!._id]
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user!._id },
        { members: req.user!._id }
      ]
    }).populate('owner', 'name email profilePicture');
    
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('members', 'name email profilePicture');
      
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership
    if (project.owner.toString() !== req.user!._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user!._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
