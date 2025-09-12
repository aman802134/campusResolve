import { z } from 'zod';

export const createCampusSchema = z.object({
  name: z.string().min(1, 'Campus name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().regex(/^\d{5,6}$/, 'Pin code must be 5 or 6 digits'),
  campusCode: z.string().min(1, 'Campus code is required'),
});

export const updateCampusSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pinCode: z
    .string()
    .regex(/^\d{5,6}$/)
    .optional(),
  campusCode: z.string().min(1).optional(),
});
