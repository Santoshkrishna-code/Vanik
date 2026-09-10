"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelChallan = exports.confirmChallan = exports.getChallanById = exports.getChallans = exports.createChallan = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const challan_validator_1 = require("../validators/challan.validator");
const challan_service_1 = require("../services/challan.service");
const createChallan = async (req, res) => {
    try {
        const validatedData = challan_validator_1.createChallanSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // Generate challan number (simplified logic)
        const count = await prisma_1.default.challan.count();
        const challanNumber = `CHL-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        // Get snapshot data for products
        const productIds = validatedData.items.map(item => item.productId);
        const products = await prisma_1.default.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map(p => [p.id, p]));
        let totalQuantity = 0;
        const challanItemsData = validatedData.items.map(item => {
            const product = productMap.get(item.productId);
            if (!product)
                throw new Error(`Product ${item.productId} not found`);
            totalQuantity += item.quantity;
            return {
                productId: product.id,
                productNameSnapshot: product.name,
                skuSnapshot: product.sku,
                unitPriceSnapshot: product.unitPrice,
                quantity: item.quantity
            };
        });
        const challan = await prisma_1.default.challan.create({
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
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
        }
        else {
            console.error('Create challan error:', error);
            res.status(500).json({ success: false, message: error.message || 'Internal server error' });
        }
    }
};
exports.createChallan = createChallan;
const getChallans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [challans, total] = await Promise.all([
            prisma_1.default.challan.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { name: true, mobile: true } },
                    user: { select: { name: true } }
                }
            }),
            prisma_1.default.challan.count()
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
    }
    catch (error) {
        console.error('Get challans error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getChallans = getChallans;
const getChallanById = async (req, res) => {
    try {
        const id = req.params.id;
        const challan = await prisma_1.default.challan.findUnique({
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
    }
    catch (error) {
        console.error('Get challan by id error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getChallanById = getChallanById;
const confirmChallan = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const confirmedChallan = await (0, challan_service_1.confirmChallanTransaction)(id, userId);
        res.json({ success: true, message: 'Challan confirmed successfully', challan: confirmedChallan });
    }
    catch (error) {
        if (error.code === 'INSUFFICIENT_STOCK') {
            res.status(409).json({
                success: false,
                message: error.message,
                available: error.available,
                requested: error.requested
            });
        }
        else if (error.message === 'Challan not found') {
            res.status(404).json({ success: false, message: error.message });
        }
        else if (error.message === 'Only Draft challans can be confirmed') {
            res.status(400).json({ success: false, message: error.message });
        }
        else {
            console.error('Confirm challan error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.confirmChallan = confirmChallan;
const cancelChallan = async (req, res) => {
    try {
        const id = req.params.id;
        const challan = await prisma_1.default.challan.findUnique({ where: { id } });
        if (!challan) {
            res.status(404).json({ success: false, message: 'Challan not found' });
            return;
        }
        if (challan.status !== 'Draft') {
            res.status(400).json({ success: false, message: 'Only Draft challans can be cancelled' });
            return;
        }
        const cancelledChallan = await prisma_1.default.challan.update({
            where: { id },
            data: { status: 'Cancelled' }
        });
        res.json({ success: true, message: 'Challan cancelled successfully', challan: cancelledChallan });
    }
    catch (error) {
        console.error('Cancel challan error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.cancelChallan = cancelChallan;
