import express from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/:projectId', getAnalytics);

export default router;
