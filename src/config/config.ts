import dotenv from 'dotenv';
dotenv.config(); // Load from .env

export const config = {
  port: parseInt(process.env.PORT as string, 10) || 5001,
  mongoUri: process.env.MONGO_URI as string,
  jwt: {
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  },
};
