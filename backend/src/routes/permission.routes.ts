import { Router } from 'express';
import {
  getPermissions,
  getPermissionTree,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from '../controllers/permission.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('permission:list'), getPermissions);
router.get('/tree', requirePermission('permission:list'), getPermissionTree);
router.get('/:id', requirePermission('permission:read'), getPermissionById);
router.post('/', requirePermission('permission:create'), createPermission);
router.put('/:id', requirePermission('permission:update'), updatePermission);
router.delete('/:id', requirePermission('permission:delete'), deletePermission);

export default router;
