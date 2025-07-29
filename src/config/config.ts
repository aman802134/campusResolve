import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load from .env

export const config = {
  port: (process.env.PORT as string) || 5001,
  mongoUri: process.env.MONGO_URI as string,
  seedPass: process.env.SEED_PASSWORD as string,
  jwt: {
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  },
  // Configure cloudinary and export the instance
  cloudinary: (() => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  })(),
};
