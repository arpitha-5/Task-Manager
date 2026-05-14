import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  profilePicture?: string;
  workspaces: mongoose.Types.ObjectId[];
  currentWorkspace?: mongoose.Types.ObjectId;
  refreshToken?: string;
  isEmailVerified: boolean;
  googleId?: string;
  githubId?: string;
  matchPassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member',
  },
  profilePicture: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random',
  },
  workspaces: [{
    type: Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  currentWorkspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  refreshToken: {
    type: String,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  googleId: String,
  githubId: String,
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
