import express from 'express';
import { validateRequest } from '../validations/validate-request';

import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';
import {
  adminVarificationSchema,
  updateAdminVarificationSchema,
} from '../validations/admin-verification-schema-validation';
import { createAdmin, getAdmins, updateAdmin } from '../controllers/admin-verificaton.controller';
const router = express.Router();

router.post(
  '/create-admin',
  validateRequest(adminVarificationSchema),
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  createAdmin,
);
router.get('/get-verified-admins', authenticate, authorize(USER_ROLES.SUPER_ADMIN), getAdmins);
router.patch(
  '/update-verified-user',
  validateRequest(updateAdminVarificationSchema),
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  updateAdmin,
);

export const verifiedAdmins = router;
