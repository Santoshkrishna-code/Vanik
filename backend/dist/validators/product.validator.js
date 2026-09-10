"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
const zod_1 = require("zod");
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    sku: zod_1.z.string().min(2, 'SKU is required'),
    category: zod_1.z.string().optional().or(zod_1.z.literal('')),
    unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
    minimumStock: zod_1.z.number().int().min(0).default(0),
    location: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
