import mongoose from 'mongoose';
import { config } from '../config/config';
import { ApiError } from '../utils/api-error';
import { STATUS_CODE } from '../types/enums';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri as string, {
      dbName: 'campusresolve',
    });
    console.log(`✅ MongoDB connected successfully`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new ApiError(STATUS_CODE.internal_server_err, 'internal server error');
  }
};
