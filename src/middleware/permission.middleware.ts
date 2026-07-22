import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const requirePermission = (permissionCode: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: '未登录' });
    }

    if (user.roleCodes?.includes('super_admin')) {
      return next();
    }

    if (user.permissionCodes?.includes(permissionCode)) {
      return next();
    }

    return res.status(403).json({ message: '权限不足，无法访问' });
  };
};

export const requireRole = (roleCode: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: '未登录' });
    }

    if (user.roleCodes?.includes('super_admin')) {
      return next();
    }

    if (user.roleCodes?.includes(roleCode)) {
      return next();
    }

    return res.status(403).json({ message: '权限不足，无法访问' });
  };
};
