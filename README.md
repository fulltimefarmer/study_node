# 后台管理系统

基于 **前后端分离** 架构的 RBAC 权限管理系统。

## 技术栈

### 后端 (backend/)
- **Node.js + Express.js** - Web 服务框架
- **PostgreSQL 18** - 关系型数据库
- **Prisma** - ORM 数据库工具
- **JWT** - 用户认证
- **TypeScript** - 类型安全

### 前端 (frontend/)
- **Next.js 14** (App Router) - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

## 项目结构

```
.
├── backend/               # 后端服务
│   ├── prisma/
│   │   ├── schema.prisma  # 数据库模型
│   │   └── seed.ts        # 数据初始化脚本
│   ├── src/
│   │   ├── config/        # 配置
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数
│   │   └── index.ts       # 入口
│   ├── .env               # 环境变量
│   └── package.json
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── app/           # Next.js App Router 页面
│   │   ├── components/    # 组件
│   │   ├── lib/           # 工具库
│   │   └── types/         # 类型定义
│   ├── .env.local         # 环境变量
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求
- Node.js >= 18
- PostgreSQL 18

### 1. 配置数据库

确保 PostgreSQL 已启动，然后创建数据库：

```sql
CREATE DATABASE admin_db;
```

### 2. 配置环境变量

**后端** (`backend/.env`)：
```env
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/admin_db?schema=public"
JWT_SECRET=admin_system_secret_key_2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

**前端** (`frontend/.env.local`)：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 3. 启动后端

```bash
cd backend
npm install
npx prisma migrate dev --name init  # 创建数据库表
npm run prisma:seed                  # 初始化种子数据
npm run dev                          # 启动开发服务器 (端口 4000)
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev  # 启动开发服务器 (端口 3000)
```

### 5. 访问系统

打开浏览器访问：http://localhost:3000

## 默认账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | 123456 | 超级管理员 | 所有权限 |
| manager | 123456 | 管理员 | 部分权限 |
| user | 123456 | 普通用户 | 只读 |

## 功能模块

### 1. 登录页面
- 用户名密码登录
- JWT Token 认证
- 测试账号提示

### 2. 主界面
- 左侧导航侧边栏（可折叠）
- 顶部用户信息栏（面包屑 + 下拉菜单）
- 欢迎页统计卡片

### 3. 权限管理
- **用户管理**：增删改查、搜索分页、分配角色
- **角色管理**：增删改查、树形权限配置
- **权限管理**：树形结构展示、支持菜单/按钮/API 三种类型

## 数据模型 (RBAC)

```
User ──┐
       ├─ UserRole ── Role ── RolePermission ── Permission
       │
       └── 多对多：一个用户可以有多个角色
           一个角色可以有多个权限
           Permission 自关联：支持树形结构
```

## API 接口

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 退出登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理
- `GET /api/users` - 获取用户列表（分页）
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 角色管理
- `GET /api/roles` - 获取角色列表
- `GET /api/roles/:id` - 获取角色详情
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色

### 权限管理
- `GET /api/permissions` - 获取权限列表
- `GET /api/permissions/tree` - 获取权限树
- `GET /api/permissions/:id` - 获取权限详情
- `POST /api/permissions` - 创建权限
- `PUT /api/permissions/:id` - 更新权限
- `DELETE /api/permissions/:id` - 删除权限
