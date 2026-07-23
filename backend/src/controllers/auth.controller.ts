import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
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
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const token = generateToken({ id: user.id, username: user.username });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const roleCodes: string[] = [];
    const permissionCodes: string[] = [];
    const roles: any[] = [];
    const menus: any[] = [];

    for (const ur of user.roles) {
      roleCodes.push(ur.role.code);
      roles.push({ id: ur.role.id, name: ur.role.name, code: ur.role.code });
      for (const rp of ur.role.permissions) {
        permissionCodes.push(rp.permission.code);
        if (rp.permission.type === 'menu') {
          menus.push(rp.permission);
        }
      }
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        ...userWithoutPassword,
        roles,
        roleCodes,
        permissionCodes,
        menus,
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

    const allMenus = await prisma.permission.findMany({
      where: { type: 'menu' },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    let accessibleMenus = allMenus;
    if (!user.roleCodes.includes('super_admin')) {
      accessibleMenus = allMenus.filter(p =>
        user.permissionCodes.includes(p.code)
      );
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        roles: user.roles,
        roleCodes: user.roleCodes,
        permissionCodes: user.permissionCodes,
      },
      menus: accessibleMenus,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
};
