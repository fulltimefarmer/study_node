import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types';

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: '未登录，请先登录' });
    }

    const decoded = verifyToken(token) as { id: number; username: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const roleCodes: string[] = [];
    const permissionCodes: string[] = [];
    const roles: { id: number; name: string; code: string }[] = [];

    for (const ur of user.roles) {
      roleCodes.push(ur.role.code);
      roles.push({ id: ur.role.id, name: ur.role.name, code: ur.role.code });
      for (const rp of ur.role.permissions) {
        permissionCodes.push(rp.permission.code);
      }
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles,
      roleCodes,
      permissionCodes,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

export default authMiddleware;
