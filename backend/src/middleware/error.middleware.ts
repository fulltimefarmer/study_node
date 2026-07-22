import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    path: req.originalUrl
  });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err.message);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message
  });
};
