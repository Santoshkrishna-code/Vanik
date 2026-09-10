import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { stockMovementSchema } from '../validators/inventory.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createStockMovement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = stockMovementSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: validatedData.productId } });
    
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    let newStock = product.currentStock;
    if (validatedData.type === 'IN') {
      newStock += validatedData.quantity;
    } else if (validatedData.type === 'OUT') {
      newStock -= validatedData.quantity;
    }

    if (newStock < 0) {
      res.status(409).json({ 
        success: false, 
        message: 'Insufficient stock', 
        available: product.currentStock, 
        requested: validatedData.quantity 
      });
      return;
    }

    // Transaction to ensure atomicity
    const result = await prisma.$transaction([
      prisma.product.update({
        where: { id: validatedData.productId },
        data: { currentStock: newStock }
      }),
      prisma.stockMovement.create({
        data: {
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          type: validatedData.type,
          reason: validatedData.reason,
          createdBy: userId
        }
      })
    ]);

    res.status(201).json({ success: true, product: result[0], movement: result[1] });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Create stock movement error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.stockMovement.count()
    ]);

    res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
