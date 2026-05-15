import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'Active' | 'Archived' | 'Completed';
  category?: string;
  deadline: Date;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  color?: string;
  coverImage?: string;
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Completed'],
    default: 'Active',
  },
  category: String,
  deadline: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  color: {
    type: String,
    default: '#3b82f6',
  },
  coverImage: String,
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);
