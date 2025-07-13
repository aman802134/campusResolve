import { Request } from 'express';
import { Jwt_Payload } from './auth.payload';

export interface AuthRequest extends Request {
  user?: Jwt_Payload;
}
