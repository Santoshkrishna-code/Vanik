"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallanSchema = exports.challanItemSchema = void 0;
const zod_1 = require("zod");
exports.challanItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid Product ID'),
    quantity: zod_1.z.number().int().positive('Quantity must be greater than 0'),
});
exports.createChallanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Invalid Customer ID'),
    items: zod_1.z.array(exports.challanItemSchema).min(1, 'At least one item is required'),
});
