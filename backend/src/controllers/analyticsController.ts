import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';

// @desc    Get full analytics for a workspace
// @route   GET /api/analytics/:workspaceId
// @access  Private
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = new mongoose.Types.ObjectId(req.params.workspaceId);
    const projects = await Project.find({ workspace: workspaceId });
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } });
    const workspace = await Workspace.findById(workspaceId);

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    // Status distribution
    const statusDistribution = [
      { name: 'Backlog', value: tasks.filter(t => t.status === 'Backlog').length, color: '#64748b' },
      { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: '#3b82f6' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#f59e0b' },
      { name: 'Review', value: tasks.filter(t => t.status === 'Review').length, color: '#8b5cf6' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    // Priority distribution
    const priorityDistribution = [
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#64748b' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#3b82f6' },
      { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#f59e0b' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'Urgent').length, color: '#ef4444' },
      { name: 'Critical', value: tasks.filter(t => t.priority === 'Critical').length, color: '#dc2626' },
    ];

    // Per-project breakdown
    const projectBreakdown = projects.map(p => {
      const pTasks = tasks.filter(t => t.project.toString() === p._id.toString());
      const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
      return {
        name: p.name,
        total: pTasks.length,
        completed: pCompleted,
        progress: pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0,
        color: p.color || '#3b82f6',
      };
    });

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const created = tasks.filter(t => {
        const c = new Date((t as any).createdAt);
        return c >= dayStart && c < dayEnd;
      }).length;
      const completed = tasks.filter(t => {
        const u = new Date((t as any).updatedAt);
        return t.status === 'Completed' && u >= dayStart && u < dayEnd;
      }).length;
      weeklyActivity.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        created,
        completed,
      });
    }

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'Active').length,
          teamMembers: workspace?.members?.length || 1,
          completionRate,
        },
        statusDistribution,
        priorityDistribution,
        projectBreakdown,
        weeklyActivity,
      },
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
