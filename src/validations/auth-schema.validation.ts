import { z } from 'zod';
import { USER_ROLES } from '../types/enums';

// Unified role enum for consistency
export type Role = z.infer<typeof USER_ROLES>;

export const GenderEnum = z.enum(['male', 'female', 'other']);

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),

    // ⬇️ This replaces `role`
    requestedRole: z.enum(USER_ROLES).optional(),

    campus: z.string().min(1, 'Campus is required'), // should be an ObjectId string
    department: z.string().optional(), // required conditionally

    phone: z.string().optional(),
    gender: GenderEnum.optional(),
    avatarUrl: z.string().url('Avatar must be a valid URL').optional(),
  })
  .superRefine((data, ctx) => {
    // Roles that require a department
    const needsDept: USER_ROLES[] = [
      USER_ROLES.STUDENT,
      USER_ROLES.FACULTY_ACADEMIC,
      USER_ROLES.FACULTY_NON_ACADEMIC,
      USER_ROLES.DEPARTMENT_ADMIN,
    ];

    if (data.requestedRole && needsDept.includes(data.requestedRole) && !data.department) {
      ctx.addIssue({
        path: ['department'],
        code: z.ZodIssueCode.custom,
        message: 'Department is required for this role',
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
