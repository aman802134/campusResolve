// src/modules/auth/auth.validation.ts

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'faculty', 'department_admin', 'campus_admin', 'super_admin']),
  facultyType: z.enum(['academic', 'non_academic']).optional(), // Only needed if role is faculty
  campus: z.string().min(1, 'Campus is required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
