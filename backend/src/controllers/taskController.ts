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
    const { title, description, status, priority, dueDate, project, projectId, assignedTo, order } = req.body;
    const finalProjectId = project || projectId;

    if (!finalProjectId) {
       return res.status(400).json({ success: false, message: 'Please provide a project ID' });
    }

    const projectExists = await Project.findById(finalProjectId);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate,
      project: finalProjectId,
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

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.query;
    let query: any = {};

    if (projectId) {
      query.project = projectId;
    } else {
      // If no projectId, get all tasks for all projects the user is in
      const projects = await Project.find({
        $or: [
          { owner: req.user!._id },
          { members: req.user!._id }
        ]
      });
      query.project = { $in: projects.map(p => p._id) };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email profilePicture')
      .populate('project', 'name color')
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
    const { tasks } = req.body; 

    const updatePromises = tasks.map((t: any) => 
      Task.findByIdAndUpdate(t.id, { order: t.order, status: t.status })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ success: true, message: 'Tasks reordered' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
