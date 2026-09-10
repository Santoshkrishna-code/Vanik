import { Router } from 'express';
import { login, getMe, register } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register); // Used for seeding users
router.post('/login', login);
router.get('/me', authenticate, getMe as any);

export default router;
