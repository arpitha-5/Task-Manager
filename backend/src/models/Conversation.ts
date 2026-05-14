import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  workspace: mongoose.Types.ObjectId;
  name?: string;
  isGroup: boolean;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
  };
}

const ConversationSchema: Schema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  name: String,
  isGroup: {
    type: Boolean,
    default: false,
  },
  lastMessage: {
    content: String,
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
  },
}, {
  timestamps: true
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
