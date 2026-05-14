import express from 'express';
import { 
  prioritizeTasks, 
  analyzeProjectHealth, 
  breakdownTask 
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/prioritize', prioritizeTasks);
router.get('/project-health/:projectId', analyzeProjectHealth);
router.post('/breakdown', breakdownTask);

export default router;
