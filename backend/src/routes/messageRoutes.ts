import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getWorkspaceMembers,
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/conversations/:projectId', getConversations);
router.get('/members/:projectId', getWorkspaceMembers);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);
router.post('/conversation', createConversation);

export default router;
