// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // 提取所有校验错误信息
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        code: 400,
        message: '参数校验失败',
        errors
      });
    }
    
    // 校验通过，把清洗后的数据放回 req.body
    req.body = result.data;
    next();
  };
};