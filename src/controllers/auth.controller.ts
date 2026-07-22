import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role, Permission } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({
      where: { username },
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
    });

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'admin_system_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userData = user.toJSON();
    const permissionCodes = new Set<string>();
    const roleCodes = new Set<string>();
    const menuPermissions: any[] = [];

    if (userData.roles) {
      for (const role of userData.roles) {
        roleCodes.add(role.code);
        if (role.permissions) {
          for (const perm of role.permissions) {
            permissionCodes.add(perm.code);
            if (perm.type === 'menu') {
              menuPermissions.push(perm);
            }
          }
        }
      }
    }

    const { password: _, ...userWithoutPassword } = userData;

    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        ...userWithoutPassword,
        roles: userData.roles?.map((r: any) => ({ id: r.id, name: r.name, code: r.code })) || [],
        roleCodes: Array.from(roleCodes),
        permissionCodes: Array.from(permissionCodes),
        menus: menuPermissions,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: '退出登录成功' });
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: '未登录' });
    }

    const menuPermissions = await Permission.findAll({
      where: { type: 'menu' },
      order: [['sort', 'ASC']],
    });

    let accessibleMenus = menuPermissions;
    if (!user.roleCodes?.includes('super_admin')) {
      accessibleMenus = menuPermissions.filter((p: any) =>
        user.permissionCodes?.includes(p.code)
      );
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        roles: user.roles?.map((r: any) => ({ id: r.id, name: r.name, code: r.code })) || [],
        roleCodes: user.roleCodes || [],
        permissionCodes: user.permissionCodes || [],
      },
      menus: accessibleMenus,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
};
