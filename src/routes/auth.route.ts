import express from 'express';
import { validateRequest } from '../validations/validate-request';
import { loginSchema, registerSchema } from '../validations/auth-schema.validation';
import {
  authMe,
  getUserById,
  getUsers,
  login,
  logout,
  refreshAccessToken,
  register,
  requestRole,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import upload from '../multer/multer.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';

const router = express.Router();
router.post('/register', upload.single('avatarUrl'), register);
router.post('/login', validateRequest(loginSchema), login);
router.patch('/request-role', authenticate, requestRole);
router.post('/refreshToken', refreshAccessToken);
router.get('/me', authenticate, authMe);
router.post('/logout', logout);
router.get(
  '/get-users',
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.CAMPUS_HEAD,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.DEPARTMENT_HEAD,
  ),
  getUsers,
);
router.get('/get-user/:userId', authenticate, getUserById);

export const userAuthRoute = router;
