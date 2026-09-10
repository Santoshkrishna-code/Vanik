import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { productSchema } from '../validators/product.validator';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = productSchema.parse(req.body);
    
    const existing = await prisma.product.findUnique({ where: { sku: validatedData.sku } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json({ success: true, product });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Create product error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { sku: { contains: search, mode: 'insensitive' as any } },
            { category: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        movements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    res.json({ success: true, product });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Update product error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // Check for existing movements or challan items
    const product: any = await prisma.product.findUnique({ 
      where: { id }, 
      include: { movements: true, challanItems: true } 
    });
    
    if (product && ((product.movements && product.movements.length > 0) || (product.challanItems && product.challanItems.length > 0))) {
      res.status(409).json({ success: false, message: 'Cannot delete product with existing inventory movements or challans.' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else {
      console.error('Delete product error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
