import express from 'express';
import { validateRequest } from '../validations/validate-request';
import { loginSchema, registerSchema } from '../validations/auth-schema.validation';
import { login, logout, register } from '../controllers/auth.controller';

const router = express.Router();
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);

export const authRoute = router;
