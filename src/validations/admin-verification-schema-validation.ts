import { z } from 'zod';
import { GENDER, USER_ROLES, USER_STATUS } from '../types/enums';

export const adminVarificationSchema = z.object({
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
  phone: z.string().min(10, 'Minimum 10 digit is needed').max(10, 'maximum 10 digit is needed'),
  gender: z.enum(GENDER),
});
export const updateAdminVarificationSchema = z.object({
  externalId: z
    .string()
    .min(1, 'External ID is required')
    .max(10, 'External ID must not exceed 10 characters'), // QVC-STU001 is 10 chars, so 20 is safe
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(35, 'Name must not exceed 100 characters'),

  email: z.string().email('Invalid email address').min(5, 'Email is required'),
  campus: z.string().regex(/^[a-f\d]{24}$/i, 'Campus ID must be a valid MongoDB ObjectId'),
  phone: z.string().min(10, 'Minimum 10 digit is needed').max(10, 'maximum 10 digit is needed'),
  gender: z.enum(GENDER),
});
