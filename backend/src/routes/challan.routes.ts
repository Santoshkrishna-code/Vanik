import { Router } from 'express';
import { 
  createChallan, 
  getChallans, 
  getChallanById, 
  confirmChallan, 
  cancelChallan 
} from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// View challans
router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getChallans);
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getChallanById);

// Create challan (Draft)
router.post('/', authorize(['ADMIN', 'SALES']), createChallan as any);

// Confirm or Cancel
router.post('/:id/confirm', authorize(['ADMIN', 'SALES', 'WAREHOUSE']), confirmChallan as any);
router.post('/:id/cancel', authorize(['ADMIN', 'SALES']), cancelChallan as any);

export default router;
