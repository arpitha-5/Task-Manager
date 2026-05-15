import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';

// @desc    Get full analytics for a project
// @route   GET /api/analytics/:projectId
// @access  Private
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = new mongoose.Types.ObjectId(req.params.projectId);
    const tasks = await Task.find({ project: projectId });
    const project = await Project.findById(projectId);

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed' && t.status !== 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    // Status distribution
    const statusDistribution = [
      { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: '#3b82f6' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#f59e0b' },
      { name: 'Review', value: tasks.filter(t => t.status === 'Review').length, color: '#8b5cf6' },
      { name: 'Done', value: completedTasks, color: '#10b981' },
    ].filter(s => s.value > 0);

    // Priority distribution
    const priorityDistribution = [
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#64748b' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#3b82f6' },
      { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#f59e0b' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'Urgent').length, color: '#ef4444' },
    ].filter(p => p.value > 0);

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
        return (t.status === 'Completed' || t.status === 'Done') && u >= dayStart && u < dayEnd;
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
          totalProjects: 1,
          activeProjects: project ? (project.status === 'Active' ? 1 : 0) : 0,
          teamMembers: project?.members?.length || 1,
          completionRate,
        },
        statusDistribution,
        priorityDistribution,
        projectBreakdown: project ? [{
          name: project.name,
          total: totalTasks,
          completed: completedTasks,
          progress: completionRate,
          color: project.color || '#3b82f6',
        }] : [],
        weeklyActivity,
      },
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

