import { z } from 'zod';
import { USER_ROLES } from '../types/enums';

export const userVerificationSchema = z.object({
  externalId: z
    .string()
    .min(1, 'External ID is required')
    .max(15, 'External ID must not exceed 10 characters'), // QVC-STU001 is 10 chars, so 20 is safe
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(35, 'Name must not exceed 100 characters'),

  email: z.string().email('Invalid email address').min(5, 'Email is required'),
  role: z.enum(USER_ROLES, { message: 'Role must be a valid user role' }),
  campus: z.string().regex(/^[a-f\d]{24}$/i, 'Campus ID must be a valid MongoDB ObjectId'),
  department: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Department ID must be a valid MongoDB ObjectId')
    .optional(),
});
export const userUpdationVerificationSchema = z.object({
  externalId: z
    .string()
    .min(1, 'External ID is required')
    .max(15, 'External ID must not exceed 10 characters')
    .optional(), // QVC-STU001 is 10 chars, so 20 is safe
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(35, 'Name must not exceed 100 characters')
    .optional(),
  role: z.enum(USER_ROLES, { message: 'Role must be a valid user role' }).optional(),
  email: z.string().email('Invalid email address').min(5, 'Email is required').optional(),
  campus: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Campus ID must be a valid MongoDB ObjectId')
    .optional(),
  department: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Department ID must be a valid MongoDB ObjectId')
    .optional(),
});
