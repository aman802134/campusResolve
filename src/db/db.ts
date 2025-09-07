import mongoose from 'mongoose';
import { config } from '../config/config';
import { ApiError } from '../utils/api-error';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri as string, {
      dbName: 'campusresolve',
    });
    console.log(`✅ MongoDB connected successfully`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new ApiError(500, 'internal server error');
  }
};
