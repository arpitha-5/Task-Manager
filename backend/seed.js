const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password',
    role: 'admin',
    profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
  },
  {
    name: 'Member User',
    email: 'member@demo.com',
    password: 'password',
    role: 'member',
    profilePicture: 'https://ui-avatars.com/api/?name=Member+User&background=FF5733&color=fff'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing users
    await User.deleteMany({ email: { $in: ['admin@demo.com', 'member@demo.com'] } });
    console.log('Cleared demo users if they existed');

    // Insert new users
    await User.create(users);
    console.log('Demo users created successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
