import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats/:workspaceId
// @access  Private
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = new mongoose.Types.ObjectId(req.params.workspaceId);

    const projects = await Project.find({ workspace: workspaceId });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });

    const stats = {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      activeTasks: tasks.filter(t => t.status !== 'Completed').length,
      taskStatusDistribution: [
        { name: 'Backlog', value: tasks.filter(t => t.status === 'Backlog').length },
        { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
        { name: 'Review', value: tasks.filter(t => t.status === 'Review').length },
        { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length },
      ],
      productivityTrend: [
        { day: 'Mon', completed: 12 },
        { day: 'Tue', completed: 18 },
        { day: 'Wed', completed: 15 },
        { day: 'Thu', completed: 25 },
        { day: 'Fri', completed: 20 },
        { day: 'Sat', completed: 8 },
        { day: 'Sun', completed: 5 },
      ]
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
