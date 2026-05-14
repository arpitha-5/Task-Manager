import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Testing' | 'Blocked' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  dueDate: Date;
  startDate?: Date;
  project: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  dependencies: mongoose.Types.ObjectId[];
  labels: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  attachments: {
    name: string;
    url: string;
    fileType: string;
  }[];
  order: number;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Blocked', 'Completed'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent', 'Critical'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  startDate: Date,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  subtasks: [{
    title: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  labels: [String],
  estimatedTime: Number,
  actualTime: {
    type: Number,
    default: 0
  },
  attachments: [{
    name: String,
    url: String,
    fileType: String,
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', TaskSchema);
