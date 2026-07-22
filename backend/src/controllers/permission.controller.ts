import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const type = req.query.type as string;

    const where: any = {};
    if (type) {
      where.type = type;
    }

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    res.status(200).json(permissions);
  } catch (error) {
    console.error('获取权限列表错误:', error);
    res.status(500).json({ message: '获取权限列表失败' });
  }
};

export const getPermissionTree = async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    const buildTree = (items: any[], parentId: number | null = null): any[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(permissions);

    res.status(200).json(tree);
  } catch (error) {
    console.error('获取权限树错误:', error);
    res.status(500).json({ message: '获取权限树失败' });
  }
};

export const getPermissionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });

    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }

    res.status(200).json(permission);
  } catch (error) {
    console.error('获取权限详情错误:', error);
    res.status(500).json({ message: '获取权限详情失败' });
  }
};

export const createPermission = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, type, parentId, path, icon, sort } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: '权限名称和编码不能为空' });
    }

    const existingPermission = await prisma.permission.findUnique({ where: { code } });
    if (existingPermission) {
      return res.status(400).json({ message: '权限编码已存在' });
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        code,
        type: type || 'menu',
        parentId: parentId || null,
        path: path || '',
        icon: icon || '',
        sort: sort ?? 0,
      },
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('创建权限错误:', error);
    res.status(500).json({ message: '创建权限失败' });
  }
};

export const updatePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, type, parentId, path, icon, sort } = req.body;

    const existingPerm = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPerm) {
      return res.status(404).json({ message: '权限不存在' });
    }

    if (code && code !== existingPerm.code) {
      const duplicate = await prisma.permission.findUnique({ where: { code } });
      if (duplicate) {
        return res.status(400).json({ message: '权限编码已存在' });
      }
    }

    const permission = await prisma.permission.update({
      where: { id: Number(id) },
      data: {
        name,
        code,
        type,
        parentId: parentId ?? null,
        path,
        icon,
        sort,
      },
    });

    res.status(200).json(permission);
  } catch (error) {
    console.error('更新权限错误:', error);
    res.status(500).json({ message: '更新权限失败' });
  }
};

export const deletePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });

    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }

    const childCount = await prisma.permission.count({
      where: { parentId: Number(id) },
    });

    if (childCount > 0) {
      return res.status(400).json({ message: '存在子权限，无法删除' });
    }

    await prisma.permission.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除权限错误:', error);
    res.status(500).json({ message: '删除权限失败' });
  }
};
