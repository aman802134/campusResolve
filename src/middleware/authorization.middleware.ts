// middlewares/authorize.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import { ApiError } from '../utils/api-error';

export const authorize =
  (...allowedRoles: USER_ROLES[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return next(new ApiError(403, 'Forbidden: You are not allowed to perform this action'));
    }

    next();
  };
