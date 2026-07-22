import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Role } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
      attributes: { exclude: ['password'] },
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['id', 'DESC']],
    });

    res.status(200).json({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json(user);
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

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      status: status || 'active',
    });

    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
      await (user as any).setRoles(roles);
    }

    const userWithRoles = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    res.status(201).json(userWithRoles);
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, status, roleIds } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await user.update(updateData);

    if (roleIds !== undefined) {
      const roles = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
      await (user as any).setRoles(roles);
    }

    const userWithRoles = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    res.status(200).json(userWithRoles);
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
};
