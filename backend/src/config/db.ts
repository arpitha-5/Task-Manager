import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || '';
    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected to Atlas`);
  } catch (error: any) {
    console.warn(`⚠️ Atlas connection failed: ${error.message}`);
    console.log(`🚀 Starting In-Memory MongoDB Fallback...`);
    
    try {
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Started: ${memoryUri}`);
    } catch (fallbackError: any) {
      console.error(`❌ Critical: In-Memory MongoDB failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
