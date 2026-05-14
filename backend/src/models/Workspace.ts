import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  owner: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }[];
  settings: {
    isPrivate: boolean;
    allowMemberInvite: boolean;
  };
}

const WorkspaceSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a workspace name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: String,
  avatar: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    }
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowMemberInvite: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Generate slug before saving
WorkspaceSchema.pre<IWorkspace>('save', async function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().split(' ').join('-');
  }
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
