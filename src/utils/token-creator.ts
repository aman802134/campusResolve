import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.accessSecret!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.refreshSecret!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};
