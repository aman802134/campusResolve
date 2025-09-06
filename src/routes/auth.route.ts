import express from 'express';
import { validateRequest } from '../validations/validate-request';
import { loginSchema, registerSchema } from '../validations/auth-schema.validation';
import {
  authMe,
  login,
  logout,
  refreshAccessToken,
  register,
  requestRole,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import upload from '../multer/multer.middleware';

const router = express.Router();
router.post('/register', upload.single('avatarUrl'), register);
router.post('/login', validateRequest(loginSchema), login);
router.patch('/request-role', authenticate, requestRole);
router.post('/refreshToken', refreshAccessToken);
router.get('/me', authenticate, authMe);
router.post('/logout', logout);

export const userAuthRoute = router;
