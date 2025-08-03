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

    // Removed requestedRole – role is now inferred from verification
    externalId: z.string().min(1, 'Verification ID is required'),

    campus: z.string().min(1, 'Campus is required'), // should be an ObjectId string
    department: z.string().optional(), // required conditionally

    phone: z.string().optional(),
    gender: GenderEnum.optional(),
  })
  .superRefine((data, ctx) => {
    // You could add conditional logic here later, if needed, based on verification logic
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
