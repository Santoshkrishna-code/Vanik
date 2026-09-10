"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// View products
router.get('/', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), product_controller_1.getProducts);
router.get('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), product_controller_1.getProductById);
// Create/Edit/Delete products (Admin, Warehouse)
router.post('/', (0, role_middleware_1.authorize)(['ADMIN', 'WAREHOUSE']), product_controller_1.createProduct);
router.put('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'WAREHOUSE']), product_controller_1.updateProduct);
router.delete('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'WAREHOUSE']), product_controller_1.deleteProduct);
exports.default = router;
