import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Role, Permission } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_system_secret_key_2024') as any;

    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
            },
          ],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const userData = user.toJSON();
    const permissionCodes = new Set<string>();
    const roleCodes = new Set<string>();

    if (userData.roles) {
      for (const role of userData.roles) {
        roleCodes.add(role.code);
        if (role.permissions) {
          for (const perm of role.permissions) {
            permissionCodes.add(perm.code);
          }
        }
      }
    }

    req.user = {
      ...userData,
      roleCodes: Array.from(roleCodes),
      permissionCodes: Array.from(permissionCodes),
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

export default authMiddleware;
