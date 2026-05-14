const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Archived'],
    default: 'Active',
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline'],
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1506784951209-45079a4a4005?q=80&w=2000&auto=format&fit=crop',
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete tasks when a project is deleted
projectSchema.pre('remove', async function(next) {
  await this.model('Task').deleteMany({ project: this._id });
  next();
});

// Reverse populate with virtuals
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

module.exports = mongoose.model('Project', projectSchema);
