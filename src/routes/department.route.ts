// routes/department.routes.ts
import express from 'express';
import {
  createDepartment,
  getDepartmentById,
  getDepartments,
  updateDomain,
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';

const router = express.Router();

router.post(
  '/create-department',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  createDepartment,
);
router.get('/get-departments', getDepartments);
router.get('/get-department/:departmentId', authenticate, getDepartmentById);
router.patch(
  '/:departmentId/domain',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.CAMPUS_ADMIN),
  updateDomain,
);

export const departmentRoute = router;
