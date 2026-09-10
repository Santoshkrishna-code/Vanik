import { Router } from 'express';
import { 
  createStockMovement,
  getStockMovements
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// View stock movements (Admin, Warehouse)
router.get('/stock-movements', authorize(['ADMIN', 'WAREHOUSE']), getStockMovements);

// Create stock movement (Admin, Warehouse)
router.post('/stock-movements', authorize(['ADMIN', 'WAREHOUSE']), createStockMovement as any);

export default router;
