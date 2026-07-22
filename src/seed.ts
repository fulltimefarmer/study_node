import bcrypt from 'bcryptjs';
import sequelize from './config/database';
import { User, Role, Permission, UserRole, RolePermission } from './models';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('数据库表创建完成');

    const permissions = [
      { id: 1, name: '系统管理', code: 'system', type: 'menu' as const, parentId: null, path: '', icon: 'setting', sort: 100 },
      { id: 2, name: '用户管理', code: 'user:list', type: 'menu' as const, parentId: 1, path: '/system/users', icon: 'user', sort: 1 },
      { id: 3, name: '角色管理', code: 'role:list', type: 'menu' as const, parentId: 1, path: '/system/roles', icon: 'team', sort: 2 },
      { id: 4, name: '权限管理', code: 'permission:list', type: 'menu' as const, parentId: 1, path: '/system/permissions', icon: 'safety', sort: 3 },

      { id: 5, name: '新增用户', code: 'user:create', type: 'button' as const, parentId: 2, path: '', icon: '', sort: 1 },
      { id: 6, name: '编辑用户', code: 'user:update', type: 'button' as const, parentId: 2, path: '', icon: '', sort: 2 },
      { id: 7, name: '删除用户', code: 'user:delete', type: 'button' as const, parentId: 2, path: '', icon: '', sort: 3 },
      { id: 8, name: '查看用户', code: 'user:read', type: 'button' as const, parentId: 2, path: '', icon: '', sort: 4 },

      { id: 9, name: '新增角色', code: 'role:create', type: 'button' as const, parentId: 3, path: '', icon: '', sort: 1 },
      { id: 10, name: '编辑角色', code: 'role:update', type: 'button' as const, parentId: 3, path: '', icon: '', sort: 2 },
      { id: 11, name: '删除角色', code: 'role:delete', type: 'button' as const, parentId: 3, path: '', icon: '', sort: 3 },
      { id: 12, name: '查看角色', code: 'role:read', type: 'button' as const, parentId: 3, path: '', icon: '', sort: 4 },

      { id: 13, name: '新增权限', code: 'permission:create', type: 'button' as const, parentId: 4, path: '', icon: '', sort: 1 },
      { id: 14, name: '编辑权限', code: 'permission:update', type: 'button' as const, parentId: 4, path: '', icon: '', sort: 2 },
      { id: 15, name: '删除权限', code: 'permission:delete', type: 'button' as const, parentId: 4, path: '', icon: '', sort: 3 },
      { id: 16, name: '查看权限', code: 'permission:read', type: 'button' as const, parentId: 4, path: '', icon: '', sort: 4 },
    ];

    await Permission.bulkCreate(permissions);
    console.log('权限数据初始化完成');

    const superAdminRole = await Role.create({
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
    });

    const adminRole = await Role.create({
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
    });

    const userRole = await Role.create({
      name: '普通用户',
      code: 'user',
      description: '普通用户',
    });

    console.log('角色数据初始化完成');

    const allPermissions = await Permission.findAll();
    await (superAdminRole as any).setPermissions(allPermissions);

    const adminPermissionCodes = [
      'system', 'user:list', 'user:read', 'user:create', 'user:update',
      'role:list', 'role:read',
      'permission:list', 'permission:read',
    ];
    const adminPermissions = allPermissions.filter((p: any) => adminPermissionCodes.includes(p.code));
    await (adminRole as any).setPermissions(adminPermissions);

    const userPermissionCodes = ['system', 'user:list', 'user:read'];
    const userPermissions = allPermissions.filter((p: any) => userPermissionCodes.includes(p.code));
    await (userRole as any).setPermissions(userPermissions);

    console.log('角色权限关联完成');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const superAdmin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'active',
    });

    const adminUser = await User.create({
      username: 'manager',
      email: 'manager@example.com',
      password: hashedPassword,
      status: 'active',
    });

    const normalUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      status: 'active',
    });

    console.log('用户数据初始化完成');

    await (superAdmin as any).setRoles([superAdminRole]);
    await (adminUser as any).setRoles([adminRole]);
    await (normalUser as any).setRoles([userRole]);

    console.log('用户角色关联完成');
    console.log('数据库初始化完成！');
    console.log('默认账号: admin / 123456 (超级管理员)');
    console.log('默认账号: manager / 123456 (管理员)');
    console.log('默认账号: user / 123456 (普通用户)');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

seedDatabase();
