import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { customerSchema } from '../validators/customer.validator';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = customerSchema.parse(req.body);
    
    // Check if mobile already exists
    const existing = await prisma.customer.findUnique({ where: { mobile: validatedData.mobile } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Customer with this mobile already exists' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
      } as any,
    });

    res.status(201).json({ success: true, customer });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Create customer error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { mobile: { contains: search } },
            { businessName: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.json({ success: true, customer });
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = customerSchema.partial().parse(req.body);

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
      } as any,
    });

    res.json({ success: true, customer });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Customer not found' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    } else {
      console.error('Update customer error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // Checking if customer has challans to prevent hard deletion if tied to business data
    const customer: any = await prisma.customer.findUnique({ where: { id }, include: { challans: true } });
    if (customer && customer.challans && customer.challans.length > 0) {
      res.status(409).json({ success: false, message: 'Cannot delete customer with existing challans. Please set status to Inactive instead.' });
      return;
    }

    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Customer not found' });
    } else {
      console.error('Delete customer error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
