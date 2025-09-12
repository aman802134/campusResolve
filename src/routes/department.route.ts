// routes/department.routes.ts
import express from 'express';
import {
  assignAdminToDepartment,
  createDepartment,
  getDepartmentById,
  getDepartments,
  getDepartmentsWithCounts,
  updateDomain,
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { USER_ROLES } from '../types/enums';

const router = express.Router();

router.post('/create-department', authenticate, authorize(USER_ROLES.ADMIN), createDepartment);
router.get('/get-departments', getDepartments);
router.get('/get-department-with-count', getDepartmentsWithCounts);
router.get('/get-department/:departmentId', authenticate, getDepartmentById);
router.patch('/:departmentId/domain', authenticate, authorize(USER_ROLES.ADMIN), updateDomain);
router.patch('/assign-admin', authenticate, authorize(USER_ROLES.ADMIN), assignAdminToDepartment);
export const departmentRoute = router;
