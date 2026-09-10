"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// View stock movements (Admin, Warehouse)
router.get('/stock-movements', (0, role_middleware_1.authorize)(['ADMIN', 'WAREHOUSE']), inventory_controller_1.getStockMovements);
// Create stock movement (Admin, Warehouse)
router.post('/stock-movements', (0, role_middleware_1.authorize)(['ADMIN', 'WAREHOUSE']), inventory_controller_1.createStockMovement);
exports.default = router;
