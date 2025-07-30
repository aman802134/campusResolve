// validation/auth.validation.ts
import { z } from 'zod';
import { USER_ROLES } from '../types/enums';

export const requestRoleSchema = z
  .object({
    requestedRole: z.enum(USER_ROLES).optional(), // Optional, can be used to request a different role
    campus: z.string().min(1, 'Campus is required'), // should be an ObjectId string
    // department is conditionally required based on the requested role
    department: z.string().optional(), // Conditionally required
  })
  .superRefine((data, ctx) => {
    const needsDept = ['student', 'faculty_academic', 'faculty_non_academic', 'department_admin'];

    if (data.requestedRole && needsDept.includes(data.requestedRole)) {
      if (!data.department) {
        ctx.addIssue({
          path: ['department'],
          code: z.ZodIssueCode.custom,
          message: 'Department is required for this role',
        });
      }
    }
  });
