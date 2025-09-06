import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  superAdminAuthMe,
  refreshAccessToken,
  superAdminLogin,
  superAdminLogout,
} from '../controllers/super-admin.controller';

const router = express.Router();
router.post('/login', superAdminLogin);
router.post('/refreshToken', refreshAccessToken);
router.get('/me', authenticate, superAdminAuthMe);
router.post('/logout', superAdminLogout);

export const superAdminAuth = router;
