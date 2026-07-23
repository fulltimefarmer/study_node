import { Router } from 'express';
import {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/site.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('site:list'), getSites);
router.get('/:id', requirePermission('site:read'), getSiteById);
router.post('/', requirePermission('site:create'), createSite);
router.put('/:id', requirePermission('site:update'), updateSite);
router.delete('/:id', requirePermission('site:delete'), deleteSite);

export default router;
