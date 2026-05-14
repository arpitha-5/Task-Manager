import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import { createNotification } from '../utils/notifications';
import { Server } from 'socket.io';

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo, order } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      createdBy: req.user!._id,
      assignedTo: assignedTo || [],
      order: order || 0
    });

    // Notify assigned users
    const io: Server = req.app.get('io');
    if (assignedTo && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        if (userId.toString() !== req.user!._id.toString()) {
          await createNotification(io, {
            recipient: userId,
            sender: req.user!._id,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `You have been assigned to: ${title}`,
            link: `/tasks/${task._id}`
          });
        }
      }
    }

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email profilePicture')
      .sort('order');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Notify assigned users about update
    const io: Server = req.app.get('io');
    if (task!.assignedTo && task!.assignedTo.length > 0) {
      for (const userId of task!.assignedTo) {
        if (userId.toString() !== req.user!._id.toString()) {
          await createNotification(io, {
            recipient: userId,
            sender: req.user!._id,
            type: 'task_updated',
            title: 'Task Updated',
            message: `Task "${task!.title}" has been updated`,
            link: `/tasks/${task!._id}`
          });
        }
      }
    }

    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task order (for drag and drop)
// @route   PUT /api/tasks/reorder
// @access  Private
export const reorderTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { tasks } = req.body; // Array of { id, order, status }

    const updatePromises = tasks.map((t: any) => 
      Task.findByIdAndUpdate(t.id, { order: t.order, status: t.status })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ success: true, message: 'Tasks reordered' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks in a workspace
// @route   GET /api/tasks/workspace/:workspaceId
// @access  Private
export const getWorkspaceTasks = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email profilePicture')
      .populate('project', 'name color')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
