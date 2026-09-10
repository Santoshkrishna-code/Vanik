"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_1 = require("../controllers/challan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// View challans
router.get('/', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), challan_controller_1.getChallans);
router.get('/:id', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), challan_controller_1.getChallanById);
// Create challan (Draft)
router.post('/', (0, role_middleware_1.authorize)(['ADMIN', 'SALES']), challan_controller_1.createChallan);
// Confirm or Cancel
router.post('/:id/confirm', (0, role_middleware_1.authorize)(['ADMIN', 'SALES', 'WAREHOUSE']), challan_controller_1.confirmChallan);
router.post('/:id/cancel', (0, role_middleware_1.authorize)(['ADMIN', 'SALES']), challan_controller_1.cancelChallan);
exports.default = router;
