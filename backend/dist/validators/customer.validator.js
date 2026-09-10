"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    mobile: zod_1.z.string().min(10, 'Mobile must be at least 10 characters'),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    businessName: zod_1.z.string().optional().or(zod_1.z.literal('')),
    gstNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    customerType: zod_1.z.nativeEnum(client_1.CustType).optional(),
    address: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.nativeEnum(client_1.Status).optional(),
    followUpDate: zod_1.z.string().datetime().optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
