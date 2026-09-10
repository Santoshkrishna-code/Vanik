import { Router } from 'express';
import { 
  createCustomer, 
  getCustomers, 
  getCustomerById, 
  updateCustomer, 
  deleteCustomer 
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// View customers (Admin, Sales, Accounts, Warehouse limited - but backend just checks basic role for now)
router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getCustomers);
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getCustomerById);

// Create/Edit/Delete customers (Admin, Sales)
router.post('/', authorize(['ADMIN', 'SALES']), createCustomer as any);
router.put('/:id', authorize(['ADMIN', 'SALES']), updateCustomer as any);
router.delete('/:id', authorize(['ADMIN', 'SALES']), deleteCustomer as any);

export default router;
