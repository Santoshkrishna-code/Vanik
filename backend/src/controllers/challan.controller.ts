import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createChallanSchema } from '../validators/challan.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { confirmChallanTransaction } from '../services/challan.service';

export const createChallan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createChallanSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Generate challan number (simplified logic)
    const count = await prisma.challan.count();
    const challanNumber = `CHL-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Get snapshot data for products
    const productIds = validatedData.items.map(item => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    const challanItemsData = validatedData.items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      totalQuantity += item.quantity;
      
      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity
      };
    });

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: validatedData.customerId,
        totalQuantity,
        createdBy: userId,
        items: {
          create: challanItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, challan });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Create challan error:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
};

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, mobile: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.challan.count()
    ]);

    res.json({
      success: true,
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get challans error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    res.json({ success: true, challan });
  } catch (error) {
    console.error('Get challan by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const confirmChallan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const confirmedChallan = await confirmChallanTransaction(id, userId);

    res.json({ success: true, message: 'Challan confirmed successfully', challan: confirmedChallan });
  } catch (error: any) {
    if (error.code === 'INSUFFICIENT_STOCK') {
      res.status(409).json({ 
        success: false, 
        message: error.message, 
        available: error.available, 
        requested: error.requested 
      });
    } else if (error.message === 'Challan not found') {
      res.status(404).json({ success: false, message: error.message });
    } else if (error.message === 'Only Draft challans can be confirmed') {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.error('Confirm challan error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const cancelChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const challan = await prisma.challan.findUnique({ where: { id } });
    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status !== 'Draft') {
      res.status(400).json({ success: false, message: 'Only Draft challans can be cancelled' });
      return;
    }

    const cancelledChallan = await prisma.challan.update({
      where: { id },
      data: { status: 'Cancelled' }
    });

    res.json({ success: true, message: 'Challan cancelled successfully', challan: cancelledChallan });
  } catch (error) {
    console.error('Cancel challan error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
