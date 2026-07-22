import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const keyword = req.query.keyword as string || '';

    const where: any = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);

    const result = list.map(u => {
      const { password, roles, ...rest } = u;
      return {
        ...rest,
        roles: roles.map(ur => ur.role),
      };
    });

    res.status(200).json({
      list: result,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        roles: {
          include: {
            role: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const { password, roles, ...rest } = user;
    const result = {
      ...rest,
      roles: roles.map(ur => ur.role),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '获取用户详情失败' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, status, roleIds } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱和密码不能为空' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        status: status || 'active',
        roles: roleIds?.length
          ? {
              create: roleIds.map((roleId: number) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    const { password: _, roles, ...rest } = user;
    const result = {
      ...rest,
      roles: roles.map(ur => ur.role),
    };

    res.status(201).json(result);
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, status, roleIds } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        roles: roleIds !== undefined
          ? {
              deleteMany: {},
              create: roleIds.map((roleId: number) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    const { password: _, roles, ...rest } = user;
    const result = {
      ...rest,
      roles: roles.map(ur => ur.role),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
};
