const Task = require('../models/Task');
const Project = require('../models/Project');
const { suggestPriority, suggestAssignee } = require('../services/aiService');

// @desc    Get AI suggestions for task
// @route   GET /api/tasks/ai-suggest
// @access  Private
exports.getAiSuggestions = async (req, res) => {
    try {
        const { dueDate, description, projectId } = req.query;

        const suggestions = {
            priority: suggestPriority(dueDate, description)
        };

        if (projectId) {
            const project = await Project.findById(projectId).populate('members');
            const tasks = await Task.find({ project: projectId });
            suggestions.assignee = suggestAssignee(project.members, tasks);
        }

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    // Filter by project if project ID is provided
    if (req.query.projectId) {
      query = Task.find({ project: req.query.projectId });
    } else {
      // If not admin, only show tasks assigned to user or in projects user is member of
      if (req.user.role !== 'admin') {
        const projects = await Project.find({ members: req.user.id });
        const projectIds = projects.map(p => p._id);
        query = Task.find({ 
            $or: [
                { assignedTo: req.user.id },
                { project: { $in: projectIds } }
            ]
        });
      } else {
        query = Task.find();
      }
    }

    const tasks = await query.populate('assignedTo', 'name email profilePicture').populate('project', 'name');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const project = await Project.findById(req.body.project);
    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only admin or project admin can create tasks (simplification for now)
    const isAdmin = project.admin.toString() === req.user.id || req.user.role === 'admin';
    if (!isAdmin) {
        return res.status(401).json({ success: false, message: 'Not authorized to create tasks in this project' });
    }

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Logic for who can update:
    // Admin, Task Creator, or Assignee (for status updates)
    const project = await Project.findById(task.project);
    const isProjectAdmin = project.admin.toString() === req.user.id;
    const isCreator = task.createdBy.toString() === req.user.id;
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;

    if (!isProjectAdmin && !isCreator && !isAssignee && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    // Members can only update status and comments (simplified)
    if (!isProjectAdmin && !isCreator && req.user.role !== 'admin' && isAssignee) {
        // Limit what member can update
        const { status } = req.body;
        task = await Task.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true
        });
    } else {
        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isProjectAdmin = project.admin.toString() === req.user.id;

    if (!isProjectAdmin && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
