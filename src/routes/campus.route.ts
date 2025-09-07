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

const router = express.Router();

router.post('/create-campus', authenticate, authorize(USER_ROLES.SUPER_ADMIN), createCampus);
// routes/campus.routes.ts
router.get('/all-campus', authenticate, authorize(USER_ROLES.SUPER_ADMIN), getAllCampuses);
router.get('/get-campus/:campusId', authenticate, getCampusById);
// Update campus route
router.patch(
  '/update-campus/:campusId',
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
