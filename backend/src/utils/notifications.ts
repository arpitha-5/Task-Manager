import { Server } from 'socket.io';
import Notification from '../models/Notification';

export const createNotification = async (
  io: Server,
  data: {
    recipient: any;
    sender: any;
    type: 'task_assigned' | 'task_updated' | 'project_invite' | 'mention' | 'message';
    title: string;
    message: string;
    link?: string;
  }
) => {
  try {
    const notification = await Notification.create(data);
    
    // Populate sender for frontend display
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name profilePicture');

    // Emit via socket
    // We can emit to a room specific to the user
    io.to(data.recipient.toString()).emit('new_notification', populatedNotification);

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
