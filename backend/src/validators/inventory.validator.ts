import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const stockMovementSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  type: z.nativeEnum(MovementType),
  reason: z.string().optional().or(z.literal(''))
});
