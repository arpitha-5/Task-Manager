const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    if (process.env.NODE_ENV === 'development' && !uri.includes('mongodb+srv')) {
       // Use local URI if provided
    } else if (process.env.USE_MEMORY_DB === 'true' || !uri) {
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('Using In-Memory MongoDB for this session');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed data if using memory DB
    if (uri.includes('127.0.0.1') || process.env.USE_MEMORY_DB === 'true') {
      await seedMemoryDB();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // Fallback to memory server on error (e.g. IP whitelist issue)
    console.log('Attempting to fallback to In-Memory MongoDB...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Fallback to In-Memory MongoDB successful');
      await seedMemoryDB();
    } catch (fallbackError) {
      console.error(`Fallback Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

const seedMemoryDB = async () => {
  const User = require('../models/User');
  const Project = require('../models/Project');
  const Task = require('../models/Task');
  
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const users = [
      {
        _id: '6a009f383bdb96e98b73b7f1',
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password',
        role: 'admin',
        profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
      },
      {
        _id: '6a009f383bdb96e98b73b7f2',
        name: 'Member User',
        email: 'member@demo.com',
        password: 'password',
        role: 'member',
        profilePicture: 'https://ui-avatars.com/api/?name=Member+User&background=FF5733&color=fff'
      }
    ];
    await User.create(users);
    console.log('Memory DB seeded with demo users');
  }

  const admin = await User.findOne({ role: 'admin' });
  const member = await User.findOne({ role: 'member' });

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    const demoProject = {
      _id: '6a009f383bdb96e98b73b7fd',
      name: 'TaskFlow Pro Redesign',
      description: 'Upgrading the user interface to a modern, high-performance experience with real-time features and AI integrations.',
      status: 'Active',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      admin: admin._id,
      members: [admin._id, member._id]
    };
    await Project.create(demoProject);
    console.log('Memory DB seeded with demo project');

    const tasks = [
      {
        title: 'Initialize React 19 Frontend',
        description: 'Set up Vite with React 19 and Tailwind CSS 4.',
        project: '6a009f383bdb96e98b73b7fd',
        createdBy: admin._id,
        assignedTo: admin._id,
        status: 'Done',
        priority: 'High'
      },
      {
        title: 'Design Kanban Components',
        description: 'Create reusable board and card components with Framer Motion.',
        project: '6a009f383bdb96e98b73b7fd',
        createdBy: admin._id,
        assignedTo: member._id,
        status: 'In Progress',
        priority: 'Medium'
      },
      {
        title: 'Implement AI Priority Engine',
        description: 'Develop heuristic logic for suggesting task priorities based on deadlines.',
        project: '6a009f383bdb96e98b73b7fd',
        createdBy: admin._id,
        assignedTo: admin._id,
        status: 'To Do',
        priority: 'Urgent'
      }
    ];
    await Task.create(tasks);
    console.log('Memory DB seeded with demo tasks');
  }
};

module.exports = connectDB;
