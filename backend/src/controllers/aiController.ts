import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Project from '../models/Project';

// @desc    Suggest task priority based on due date and complexity
// @route   POST /api/ai/prioritize
// @access  Private
export const prioritizeTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { taskIds } = req.body;
    const tasks = await Task.find({ _id: { $in: taskIds } });

    const prioritizedTasks = tasks.map(task => {
      let priority = task.priority;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (diffDays <= 1) priority = 'Urgent';
      else if (diffDays <= 3) priority = 'High';
      else if (diffDays <= 7) priority = 'Medium';
      else priority = 'Low';

      return { id: task._id, suggestedPriority: priority };
    });

    res.status(200).json({ success: true, data: prioritizedTasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Analyze project health
// @route   GET /api/ai/project-health/:projectId
// @access  Private
export const analyzeProjectHealth = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const delayedTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;

    const healthScore = totalTasks === 0 ? 100 : Math.round(((completedTasks / totalTasks) * 100) - (delayedTasks * 10));
    
    let status = 'Excellent';
    if (healthScore < 40) status = 'At Risk';
    else if (healthScore < 70) status = 'Needs Attention';

    res.status(200).json({
      success: true,
      data: {
        score: Math.max(0, healthScore),
        status,
        insights: [
          `${completedTasks} tasks completed out of ${totalTasks}`,
          `${delayedTasks} tasks currently behind schedule`,
          healthScore < 70 ? 'AI suggests redistributing workload to avoid bottlenecks.' : 'Project is on track for the deadline.'
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Break down task into subtasks
// @route   POST /api/ai/breakdown
// @access  Private
export const breakdownTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    
    // Simulating AI breakdown logic
    const subtasks = [
      { title: 'Initial Research & Requirements', isCompleted: false },
      { title: 'Drafting & Design Architecture', isCompleted: false },
      { title: 'Development Phase 1: Core Implementation', isCompleted: false },
      { title: 'Review & Quality Assurance', isCompleted: false },
      { title: 'Final Deployment & Documentation', isCompleted: false }
    ];

    res.status(200).json({ success: true, data: subtasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
