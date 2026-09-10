"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmChallanTransaction = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("@prisma/client");
const confirmChallanTransaction = async (challanId, userId) => {
    return await prisma_1.default.$transaction(async (tx) => {
        // 1. Read challan & Verify status
        const challan = await tx.challan.findUnique({
            where: { id: challanId },
            include: { items: true }
        });
        if (!challan) {
            throw new Error('Challan not found');
        }
        if (challan.status !== client_1.ChallanStatus.Draft) {
            throw new Error('Only Draft challans can be confirmed');
        }
        // 2. Read required products and validate stock
        const productIds = challan.items.map(item => item.productId);
        const products = await tx.product.findMany({
            where: { id: { in: productIds } }
        });
        const productMap = new Map(products.map(p => [p.id, p]));
        for (const item of challan.items) {
            const product = productMap.get(item.productId);
            if (!product) {
                throw new Error(`Product not found for item ${item.productId}`);
            }
            if (product.currentStock < item.quantity) {
                throw {
                    code: 'INSUFFICIENT_STOCK',
                    message: `Insufficient stock for product ${product.sku}`,
                    available: product.currentStock,
                    requested: item.quantity,
                    productId: product.id
                };
            }
        }
        // 3. Deduct stock and create movements
        for (const item of challan.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { currentStock: { decrement: item.quantity } }
            });
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: client_1.MovementType.OUT,
                    reason: `Sales Challan Confirmation - ${challan.challanNumber}`,
                    createdBy: userId
                }
            });
        }
        // 4. Update challan status
        const confirmedChallan = await tx.challan.update({
            where: { id: challanId },
            data: { status: client_1.ChallanStatus.Confirmed }
        });
        return confirmedChallan;
    });
};
exports.confirmChallanTransaction = confirmChallanTransaction;
