import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { JwtPayload } from '../types/auth.payload';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, 'unauthorized , please provide valid token !');
    }
    const decode = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = decode;
    next();
  } catch (error: any) {
    throw new ApiError(401, error);
  }
};
