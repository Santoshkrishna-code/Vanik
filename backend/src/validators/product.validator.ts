import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().optional().or(z.literal('')),
  unitPrice: z.number().min(0, 'Price must be positive'),
  minimumStock: z.number().int().min(0).default(0),
  location: z.string().optional().or(z.literal(''))
});
