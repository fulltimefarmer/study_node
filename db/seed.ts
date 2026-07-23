import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  const existingPerms = await prisma.permission.count();
  if (existingPerms > 0) {
    console.log('数据库已有数据，跳过初始化');
    return;
  }

  const permissions: Prisma.PermissionCreateManyInput[] = [
    { id: 1, name: '系统管理', code: 'system', type: 'menu', parentId: null, path: '', icon: 'setting', sort: 100 },
    { id: 2, name: '用户管理', code: 'user:list', type: 'menu', parentId: 1, path: '/system/users', icon: 'user', sort: 1 },
    { id: 3, name: '角色管理', code: 'role:list', type: 'menu', parentId: 1, path: '/system/roles', icon: 'team', sort: 2 },
    { id: 4, name: '权限管理', code: 'permission:list', type: 'menu', parentId: 1, path: '/system/permissions', icon: 'safety', sort: 3 },

    { id: 5, name: '新增用户', code: 'user:create', type: 'button', parentId: 2, path: '', icon: '', sort: 1 },
    { id: 6, name: '编辑用户', code: 'user:update', type: 'button', parentId: 2, path: '', icon: '', sort: 2 },
    { id: 7, name: '删除用户', code: 'user:delete', type: 'button', parentId: 2, path: '', icon: '', sort: 3 },
    { id: 8, name: '查看用户', code: 'user:read', type: 'button', parentId: 2, path: '', icon: '', sort: 4 },

    { id: 9, name: '新增角色', code: 'role:create', type: 'button', parentId: 3, path: '', icon: '', sort: 1 },
    { id: 10, name: '编辑角色', code: 'role:update', type: 'button', parentId: 3, path: '', icon: '', sort: 2 },
    { id: 11, name: '删除角色', code: 'role:delete', type: 'button', parentId: 3, path: '', icon: '', sort: 3 },
    { id: 12, name: '查看角色', code: 'role:read', type: 'button', parentId: 3, path: '', icon: '', sort: 4 },

    { id: 13, name: '新增权限', code: 'permission:create', type: 'button', parentId: 4, path: '', icon: '', sort: 1 },
    { id: 14, name: '编辑权限', code: 'permission:update', type: 'button', parentId: 4, path: '', icon: '', sort: 2 },
    { id: 15, name: '删除权限', code: 'permission:delete', type: 'button', parentId: 4, path: '', icon: '', sort: 3 },
    { id: 16, name: '查看权限', code: 'permission:read', type: 'button', parentId: 4, path: '', icon: '', sort: 4 },

    { id: 17, name: '站点管理', code: 'site:list', type: 'menu', parentId: 1, path: '/system/sites', icon: 'global', sort: 4 },
    { id: 18, name: '新增站点', code: 'site:create', type: 'button', parentId: 17, path: '', icon: '', sort: 1 },
    { id: 19, name: '编辑站点', code: 'site:update', type: 'button', parentId: 17, path: '', icon: '', sort: 2 },
    { id: 20, name: '删除站点', code: 'site:delete', type: 'button', parentId: 17, path: '', icon: '', sort: 3 },
    { id: 21, name: '查看站点', code: 'site:read', type: 'button', parentId: 17, path: '', icon: '', sort: 4 },
  ];

  await prisma.permission.createMany({ data: permissions });
  console.log('✅ 权限数据初始化完成');

  const superAdminRole = await prisma.role.create({
    data: {
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
      permissions: {
        create: permissions.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    },
  });
  console.log('✅ 超级管理员角色创建完成');

  const adminPermCodes = [
    'system', 'user:list', 'user:read', 'user:create', 'user:update',
    'role:list', 'role:read',
    'permission:list', 'permission:read',
    'site:list', 'site:read', 'site:create', 'site:update',
  ];
  const adminPerms = permissions.filter(p => adminPermCodes.includes(p.code));

  const adminRole = await prisma.role.create({
    data: {
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
      permissions: {
        create: adminPerms.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    },
  });
  console.log('✅ 管理员角色创建完成');

  const userPermCodes = ['system', 'user:list', 'user:read'];
  const userPerms = permissions.filter(p => userPermCodes.includes(p.code));

  const userRole = await prisma.role.create({
    data: {
      name: '普通用户',
      code: 'user',
      description: '普通用户',
      permissions: {
        create: userPerms.map(p => ({
          permission: { connect: { id: p.id } }
        }))
      }
    },
  });
  console.log('✅ 普通用户角色创建完成');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const superAdmin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'active',
      roles: {
        create: [{ role: { connect: { id: superAdminRole.id } } }]
      }
    },
  });
  console.log('✅ 超级管理员用户创建完成 (admin / 123456)');

  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      email: 'manager@example.com',
      password: hashedPassword,
      status: 'active',
      roles: {
        create: [{ role: { connect: { id: adminRole.id } } }]
      }
    },
  });
  console.log('✅ 管理员用户创建完成 (manager / 123456)');

  const normalUser = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      status: 'active',
      roles: {
        create: [{ role: { connect: { id: userRole.id } } }]
      }
    },
  });
  console.log('✅ 普通用户创建完成 (user / 123456)');

  console.log('\n🎉 数据库初始化完成！');
  console.log('\n默认账号：');
  console.log('  超级管理员：admin / 123456');
  console.log('  管理员：  manager / 123456');
  console.log('  普通用户：user / 123456');
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
