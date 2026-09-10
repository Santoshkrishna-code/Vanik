"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// All customer routes require authentication
router.use(auth_middleware_1.authenticate);
// View customers (Admin, Sales, Accounts, Warehouse limited - but backend just checks basic role for now)
router.get('/', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), customer_controller_1.getCustomers);
router.get('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), customer_controller_1.getCustomerById);
// Create/Edit/Delete customers (Admin, Sales)
router.post('/', (0, role_middleware_1.authorize)(['ADMIN', 'SALES']), customer_controller_1.createCustomer);
router.put('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'SALES']), customer_controller_1.updateCustomer);
router.delete('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'SALES']), customer_controller_1.deleteCustomer);
exports.default = router;
