import express from 'express';
import {
  approveRequestedRole,
  getAllPendingRoleRequests,
  rejectRequestedRole,
} from '../controllers/assign-admin-role.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';

const router = express.Router();
router.patch(
  '/assign-role/:userId',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  approveRequestedRole,
);
router.get(
  '/pending-role-requests',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  getAllPendingRoleRequests,
);
router.patch(
  '/reject-role/:userId',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  rejectRequestedRole,
);
export const assingAdmin = router;
