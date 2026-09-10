"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const customer_validator_1 = require("../validators/customer.validator");
const createCustomer = async (req, res) => {
    try {
        const validatedData = customer_validator_1.customerSchema.parse(req.body);
        // Check if mobile already exists
        const existing = await prisma_1.default.customer.findUnique({ where: { mobile: validatedData.mobile } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Customer with this mobile already exists' });
            return;
        }
        const customer = await prisma_1.default.customer.create({
            data: {
                ...validatedData,
                followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
            },
        });
        res.status(201).json({ success: true, customer });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        }
        else {
            console.error('Create customer error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.createCustomer = createCustomer;
const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        const whereClause = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { mobile: { contains: search } },
                    { businessName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [customers, total] = await Promise.all([
            prisma_1.default.customer.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.customer.count({ where: whereClause }),
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
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await prisma_1.default.customer.findUnique({
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
    }
    catch (error) {
        console.error('Get customer by id error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const validatedData = customer_validator_1.customerSchema.partial().parse(req.body);
        const customer = await prisma_1.default.customer.update({
            where: { id },
            data: {
                ...validatedData,
                followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
            },
        });
        res.json({ success: true, customer });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
        else if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        }
        else {
            console.error('Update customer error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        // Checking if customer has challans to prevent hard deletion if tied to business data
        const customer = await prisma_1.default.customer.findUnique({ where: { id }, include: { challans: true } });
        if (customer && customer.challans && customer.challans.length > 0) {
            res.status(409).json({ success: false, message: 'Cannot delete customer with existing challans. Please set status to Inactive instead.' });
            return;
        }
        await prisma_1.default.customer.delete({ where: { id } });
        res.json({ success: true, message: 'Customer deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
        else {
            console.error('Delete customer error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.deleteCustomer = deleteCustomer;
