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
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';
import upload from '../multer/multer.middleware';
import { requestRoleSchema } from '../validations/request-role-validation';

const router = express.Router();
router.post('/register', upload.single('avatarUrl'), register);
router.post('/login', validateRequest(loginSchema), login);
router.patch('/request-role', authenticate, requestRole);
router.post('/refreshToken', refreshAccessToken);
router.get('/me', authenticate, authMe);
router.get('/get-users', authenticate, getUsers);
router.get(
  '/get-user/:userId',
  authenticate,
  authorize(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.CAMPUS_ADMIN,
    USER_ROLES.DEPARTMENT_ADMIN,
    USER_ROLES.FACULTY_ACADEMIC,
  ),
  getUserById,
);
router.post('/logout', logout);

export const authRoute = router;
