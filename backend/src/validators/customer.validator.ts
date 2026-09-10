import { z } from 'zod';
import { CustType, Status } from '@prisma/client';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  businessName: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.nativeEnum(CustType).optional(),
  address: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(Status).optional(),
  followUpDate: z.string().datetime().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});
