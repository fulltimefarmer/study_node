import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const keyword = req.query.keyword as string || '';

    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { domain: { contains: keyword } },
      ];
    }

    const [total, list] = await Promise.all([
      prisma.site.count({ where }),
      prisma.site.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);

    res.status(200).json({
      list,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取站点列表错误:', error);
    res.status(500).json({ message: '获取站点列表失败' });
  }
};

export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id: Number(id) },
    });

    if (!site) {
      return res.status(404).json({ message: '站点不存在' });
    }

    res.status(200).json(site);
  } catch (error) {
    console.error('获取站点详情错误:', error);
    res.status(500).json({ message: '获取站点详情失败' });
  }
};

export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, domain, description, status } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ message: '站点名称和域名不能为空' });
    }

    const existingSite = await prisma.site.findFirst({
      where: { domain },
    });

    if (existingSite) {
      return res.status(400).json({ message: '域名已存在' });
    }

    const site = await prisma.site.create({
      data: {
        name,
        domain,
        description: description || '',
        status: status || 'active',
      },
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('创建站点错误:', error);
    res.status(500).json({ message: '创建站点失败' });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, domain, description, status } = req.body;

    const existingSite = await prisma.site.findUnique({
      where: { id: Number(id) },
    });

    if (!existingSite) {
      return res.status(404).json({ message: '站点不存在' });
    }

    if (domain && domain !== existingSite.domain) {
      const domainExists = await prisma.site.findFirst({
        where: { domain, id: { not: Number(id) } },
      });
      if (domainExists) {
        return res.status(400).json({ message: '域名已存在' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (domain !== undefined) updateData.domain = domain;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const site = await prisma.site.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.status(200).json(site);
  } catch (error) {
    console.error('更新站点错误:', error);
    res.status(500).json({ message: '更新站点失败' });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id: Number(id) },
    });

    if (!site) {
      return res.status(404).json({ message: '站点不存在' });
    }

    await prisma.site.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除站点错误:', error);
    res.status(500).json({ message: '删除站点失败' });
  }
};
