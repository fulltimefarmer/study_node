import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const result = roles.map(r => {
      const { permissions, ...rest } = r;
      return {
        ...rest,
        permissions: permissions.map(rp => rp.permission),
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '获取角色列表失败' });
  }
};

export const getRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    const { permissions, ...rest } = role;
    const result = {
      ...rest,
      permissions: permissions.map(rp => rp.permission),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('获取角色详情错误:', error);
    res.status(500).json({ message: '获取角色详情失败' });
  }
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, permissionIds } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: '角色名称和编码不能为空' });
    }

    const existingRole = await prisma.role.findUnique({ where: { code } });
    if (existingRole) {
      return res.status(400).json({ message: '角色编码已存在' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        code,
        description: description || '',
        permissions: permissionIds?.length
          ? {
              create: permissionIds.map((permissionId: number) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const { permissions, ...rest } = role;
    const result = {
      ...rest,
      permissions: permissions.map(rp => rp.permission),
    };

    res.status(201).json(result);
  } catch (error) {
    console.error('创建角色错误:', error);
    res.status(500).json({ message: '创建角色失败' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, permissionIds } = req.body;

    const existingRole = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRole) {
      return res.status(404).json({ message: '角色不存在' });
    }

    if (code && code !== existingRole.code) {
      const duplicate = await prisma.role.findUnique({ where: { code } });
      if (duplicate) {
        return res.status(400).json({ message: '角色编码已存在' });
      }
    }

    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: {
        name,
        code,
        description,
        permissions: permissionIds !== undefined
          ? {
              deleteMany: {},
              create: permissionIds.map((permissionId: number) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const { permissions, ...rest } = role;
    const result = {
      ...rest,
      permissions: permissions.map(rp => rp.permission),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('更新角色错误:', error);
    res.status(500).json({ message: '更新角色失败' });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    if (role.code === 'super_admin') {
      return res.status(400).json({ message: '超级管理员角色不能删除' });
    }

    await prisma.role.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({ message: '删除角色失败' });
  }
};
