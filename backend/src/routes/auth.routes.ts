import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
