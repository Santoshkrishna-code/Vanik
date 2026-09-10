import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// View products
router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getProducts);
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getProductById);

// Create/Edit/Delete products (Admin, Warehouse)
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct as any);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct as any);
router.delete('/:id', authorize(['ADMIN', 'WAREHOUSE']), deleteProduct as any);

export default router;
