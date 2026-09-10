import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Login not implemented yet' });
});

export default router;
