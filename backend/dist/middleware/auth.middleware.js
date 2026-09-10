"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../utils/prisma"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
            return;
        }
        // Optionally check if user still exists in DB
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized - User not found' });
            return;
        }
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.authenticate = authenticate;
