import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('user:list'), getUsers);
router.get('/:id', requirePermission('user:read'), getUserById);
router.post('/', requirePermission('user:create'), createUser);
router.put('/:id', requirePermission('user:update'), updateUser);
router.delete('/:id', requirePermission('user:delete'), deleteUser);

export default router;
