import express from 'express';
import { createWorkspace, getWorkspaces, switchWorkspace, inviteMember } from '../controllers/workspaceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.put('/switch/:id', switchWorkspace);
router.post('/:id/invite', inviteMember);

export default router;
