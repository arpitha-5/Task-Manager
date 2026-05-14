const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admins see projects they created or are members of
      query = Project.find({
        $or: [
          { admin: req.user.id },
          { members: req.user.id }
        ]
      });
    } else {
      // Members only see projects they are part of
      query = Project.find({ members: req.user.id });
    }

    const projects = await query
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('tasks');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is member or admin of project
    const isMember = project.members.some(member => member._id.toString() === req.user.id);
    const isAdmin = project.admin._id.toString() === req.user.id;

    if (!isMember && !isAdmin && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this project' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = async (req, res) => {
  try {
    // Add user to req.body
    req.body.admin = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Only admins can create projects' });
    }

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project admin
    if (project.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Make sure user is project admin
    if (project.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (project.members.includes(userToAdd._id)) {
        return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
