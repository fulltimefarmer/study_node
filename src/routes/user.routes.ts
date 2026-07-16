// src/routes/user.routes.ts
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../types/user';

const router = Router();

// 路由定义
router.get('/', getAllUsers);       // GET /api/users 获取所有
router.get('/:id', getUserById);    // GET /api/users/1 获取单个
router.post('/', validate(createUserSchema), createUser);      // POST /api/users 创建
router.put('/:id', validate(updateUserSchema), updateUser);    // PUT /api/users/1 更新
router.delete('/:id', deleteUser);  // DELETE /api/users/1 删除

export default router;