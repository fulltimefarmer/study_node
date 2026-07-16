// src/types/user.ts
import { z } from 'zod';

// 创建用户参数校验规则
export const createUserSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符').max(20),
  email: z.email('邮箱格式不正确'),
  age: z.number().int().min(1).max(120).optional()
});

// 更新用户参数校验规则
export const updateUserSchema = createUserSchema.partial();

// 导出 TS 类型（自动从 Zod 规则推导，无需重复写）
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export interface User {
  id: number;
  username: string;
  email: string;
  age?: number;
  createdAt: string;
}