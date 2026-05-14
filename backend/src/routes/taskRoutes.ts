import express from 'express';
import { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask,
  reorderTasks,
  getWorkspaceTasks
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTask);

router.route('/project/:projectId')
  .get(getTasks);

router.route('/workspace/:workspaceId')
  .get(getWorkspaceTasks);

router.route('/reorder')
  .put(reorderTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
