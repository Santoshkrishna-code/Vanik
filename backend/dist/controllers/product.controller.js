"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const product_validator_1 = require("../validators/product.validator");
const createProduct = async (req, res) => {
    try {
        const validatedData = product_validator_1.productSchema.parse(req.body);
        const existing = await prisma_1.default.product.findUnique({ where: { sku: validatedData.sku } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
            return;
        }
        const product = await prisma_1.default.product.create({
            data: validatedData,
        });
        res.status(201).json({ success: true, product });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        }
        else {
            console.error('Create product error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        const whereClause = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.product.count({ where: whereClause }),
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
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.default.product.findUnique({
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
    }
    catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const validatedData = product_validator_1.productSchema.partial().parse(req.body);
        const product = await prisma_1.default.product.update({
            where: { id },
            data: validatedData,
        });
        res.json({ success: true, product });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
        else if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        }
        else {
            console.error('Update product error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        // Check for existing movements or challan items
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: { movements: true, challanItems: true }
        });
        if (product && ((product.movements && product.movements.length > 0) || (product.challanItems && product.challanItems.length > 0))) {
            res.status(409).json({ success: false, message: 'Cannot delete product with existing inventory movements or challans.' });
            return;
        }
        await prisma_1.default.product.delete({ where: { id } });
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
        else {
            console.error('Delete product error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.deleteProduct = deleteProduct;
