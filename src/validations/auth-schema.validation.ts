import { z } from 'zod';

// Unified role enum for consistency
export const RoleEnum = z.enum([
  'student',
  'faculty_academic',
  'faculty_non_academic',
  'department_admin',
  'campus_admin',
  'super_admin',
]);
export type Role = z.infer<typeof RoleEnum>;

export const GenderEnum = z.enum(['male', 'female', 'other']);

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),

    // ⬇️ This replaces `role`
    requestedRole: RoleEnum.optional(),

    campus: z.string().min(1, 'Campus is required'), // should be an ObjectId string
    department: z.string().optional(), // required conditionally

    phone: z.string().optional(),
    gender: GenderEnum.optional(),
    avatarUrl: z.string().url('Avatar must be a valid URL').optional(),
  })
  .superRefine((data, ctx) => {
    // Roles that require a department
    const needsDept: Role[] = [
      'student',
      'faculty_academic',
      'faculty_non_academic',
      'department_admin',
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
