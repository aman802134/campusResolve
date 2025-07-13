import { Request } from 'express';
import { Jwt_Payload } from './auth.payload';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user: JwtPayload | string;
}
