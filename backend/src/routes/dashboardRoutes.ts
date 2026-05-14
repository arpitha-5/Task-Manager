import express from 'express';
import { getStats } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/stats/:workspaceId', getStats);

export default router;
