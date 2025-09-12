// routes/campus.routes.ts
import express from 'express';
import {
  assignAdminToCampus,
  createCampus,
  getAllCampuses,
  getCampusById,
  updateCampus,
} from '../controllers/campus.controller';
import { authorize } from '../middleware/authorization.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { USER_ROLES } from '../types/enums';
import { validateRequest } from '../validations/validate-request';
import { createCampusSchema, updateCampusSchema } from '../validations/campus-schema-validation';

const router = express.Router();

router.post(
  '/create-campus',
  validateRequest(createCampusSchema),
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  createCampus,
);
// routes/campus.routes.ts
router.get('/all-campus', authenticate, authorize(USER_ROLES.SUPER_ADMIN), getAllCampuses);
router.get('/get-campus/:campusId', authenticate, getCampusById);
// Update campus route
router.patch(
  '/update-campus/:campusId',
  validateRequest(updateCampusSchema),
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  updateCampus,
);
router.patch(
  '/assign-admins',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  assignAdminToCampus,
);

export const campusRoute = router;
