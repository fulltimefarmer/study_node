import { Request, Response } from 'express';
import { Role, Permission } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json(roles);
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '获取角色列表失败' });
  }
};

export const getRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    res.status(200).json(role);
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

    const existingRole = await Role.findOne({ where: { code } });
    if (existingRole) {
      return res.status(400).json({ message: '角色编码已存在' });
    }

    const role = await Role.create({ name, code, description });

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await (role as any).setPermissions(permissions);
    }

    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json(roleWithPermissions);
  } catch (error) {
    console.error('创建角色错误:', error);
    res.status(500).json({ message: '创建角色失败' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, permissionIds } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    if (code && code !== role.code) {
      const existingRole = await Role.findOne({ where: { code } });
      if (existingRole) {
        return res.status(400).json({ message: '角色编码已存在' });
      }
    }

    await role.update({ name, code, description });

    if (permissionIds !== undefined) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await (role as any).setPermissions(permissions);
    }

    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json(roleWithPermissions);
  } catch (error) {
    console.error('更新角色错误:', error);
    res.status(500).json({ message: '更新角色失败' });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }

    if ((role as any).code === 'super_admin') {
      return res.status(400).json({ message: '超级管理员角色不能删除' });
    }

    await role.destroy();

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({ message: '删除角色失败' });
  }
};
