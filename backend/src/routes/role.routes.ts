import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('role:list'), getRoles);
router.get('/:id', requirePermission('role:read'), getRoleById);
router.post('/', requirePermission('role:create'), createRole);
router.put('/:id', requirePermission('role:update'), updateRole);
router.delete('/:id', requirePermission('role:delete'), deleteRole);

export default router;
