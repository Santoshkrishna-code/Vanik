"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.stockMovementSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid Product ID'),
    quantity: zod_1.z.number().int().positive('Quantity must be greater than 0'),
    type: zod_1.z.nativeEnum(client_1.MovementType),
    reason: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
