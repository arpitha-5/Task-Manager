import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Project from '../models/Project';

// @desc    Get or create a conversation with project members
// @route   GET /api/messages/conversations/:projectId
// @access  Private
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      project: req.params.projectId,
      participants: req.user!._id,
    })
      .populate('participants', 'name email profilePicture')
      .sort('-updatedAt');

    res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name email profilePicture')
      .sort('createdAt')
      .limit(100);

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({ success: false, message: 'Content and conversationId required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user!._id,
      content,
      readBy: [req.user!._id],
    });

    // Update conversation's lastMessage
    conversation.lastMessage = {
      content,
      sender: req.user!._id as any,
      timestamp: new Date(),
    };
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture');

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or get a direct conversation
// @route   POST /api/messages/conversation
// @access  Private
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, projectId, name, isGroup } = req.body;

    if (isGroup) {
      const conv = await Conversation.create({
        participants: [req.user!._id, ...(req.body.participantIds || [])],
        project: projectId,
        name: name || 'Group Chat',
        isGroup: true,
      });
      const populated = await Conversation.findById(conv._id)
        .populate('participants', 'name email profilePicture');
      return res.status(201).json({ success: true, data: populated });
    }

    // Check for existing 1-on-1
    let conv = await Conversation.findOne({
      project: projectId,
      isGroup: false,
      participants: { $all: [req.user!._id, participantId], $size: 2 },
    }).populate('participants', 'name email profilePicture');

    if (conv) {
      return res.status(200).json({ success: true, data: conv });
    }

    conv = await Conversation.create({
      participants: [req.user!._id, participantId],
      project: projectId,
      isGroup: false,
    });

    const populated = await Conversation.findById(conv._id)
      .populate('participants', 'name email profilePicture');

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get project members for starting chats
// @route   GET /api/messages/members/:projectId
// @access  Private
export const getWorkspaceMembers = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members', 'name email profilePicture');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const members = (project.members as any[])
      .filter((m: any) => m && m._id.toString() !== req.user!._id.toString());

    res.status(200).json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

