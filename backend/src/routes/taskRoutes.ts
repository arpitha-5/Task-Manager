import express from 'express';
import { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask,
  reorderTasks
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/reorder')
  .put(reorderTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
