import express from 'express';
import { validateRequest } from '../validations/validate-request';
import {
  userUpdationVerificationSchema,
  userVerificationSchema,
} from '../validations/user-verification-schema.validation';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';
import {
  createVerificationUser,
  getVerifiedUserById,
  getVerifiedUsers,
  updateVerificationUser,
} from '../controllers/user-verification.controller';

const router = express.Router();

router.post(
  '/create-verified-user',
  validateRequest(userVerificationSchema),
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createVerificationUser,
);
router.get(
  '/get-verified-users',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  getVerifiedUsers,
);
router.get(
  '/get-verified-user/:userId',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  getVerifiedUserById,
);
router.patch(
  '/update-verified-user/:id',
  validateRequest(userUpdationVerificationSchema),
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  updateVerificationUser,
);

export const verifiedUser = router;
