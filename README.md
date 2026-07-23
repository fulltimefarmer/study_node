# 后台管理系统（RBAC）

基于 **前后端分离** 架构的 RBAC（基于角色的访问控制）权限管理系统，支持用户管理、角色管理、权限管理三大核心模块，权限粒度覆盖菜单、按钮、API 三种类型。

## 技术栈

### 后端 (backend/)
- **Node.js + Express 5** - Web 服务框架
- **TypeScript** - 类型安全
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **CORS + Cookie** - 跨域与凭证管理

### 前端 (frontend/)
- **Next.js 14** (App Router) - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

### 数据库 (db/)
- **PostgreSQL 18** - 关系型数据库
- **Prisma 6** - ORM 数据库工具

## 项目结构

```
.
├── backend/               # 后端服务（Node.js + Express）
│   ├── src/
│   │   ├── config/        # 配置（Prisma 客户端实例）
│   │   ├── controllers/   # 控制器（auth / user / role / permission）
│   │   ├── middleware/    # 中间件（认证 / 权限校验 / 错误处理）
│   │   ├── routes/        # 路由定义
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数（JWT 签发与验证）
│   │   └── index.ts       # 应用入口
│   ├── .env.example       # 环境变量模板
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # 前端应用（Next.js 14）
│   ├── src/
│   │   ├── app/           # Next.js App Router 页面
│   │   │   ├── login/         # 登录页
│   │   │   ├── system/        # 系统管理页面
│   │   │   │   ├── users/        # 用户管理
│   │   │   │   ├── roles/        # 角色管理
│   │   │   │   └── permissions/  # 权限管理
│   │   │   ├── globals.css     # 全局样式
│   │   │   ├── layout.tsx      # 根布局
│   │   │   └── page.tsx        # 首页（仪表盘）
│   │   ├── components/    # 公共组件（Sidebar / Header / Modal 等）
│   │   ├── lib/           # 工具库（API 封装 / 认证上下文）
│   │   └── types/         # 类型定义
│   ├── .env.example       # 环境变量模板
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── db/                    # 数据库相关文件
│   ├── schema.prisma      # Prisma 数据库模型（RBAC）
│   ├── seed.ts            # 数据库种子脚本
│   ├── .env.example       # 环境变量模板
│   ├── package.json
│   └── tsconfig.json
├── file/                  # 文件存储目录（预留）
└── README.md
```

## 数据模型（RBAC）

```
User ──┐
       ├─ UserRole ── Role ── RolePermission ── Permission
       │
       └── 多对多：一个用户可以有多个角色
           一个角色可以有多个权限
           Permission 自关联：支持树形结构（父子权限）
```

| 模型 | 说明 |
|------|------|
| User | 用户，包含用户名、邮箱、密码（bcrypt 加密）、状态 |
| Role | 角色，如超级管理员、管理员、普通用户 |
| Permission | 权限，支持 menu（菜单）/ button（按钮）/ api 三种类型，自关联树形结构 |
| UserRole | 用户-角色多对多关联表 |
| RolePermission | 角色-权限多对多关联表 |

## 功能模块

### 登录页面
- 用户名密码登录
- JWT Token 认证（支持 Cookie 与 Bearer 两种方式）
- 测试账号提示

### 主界面
- 左侧导航侧边栏（可折叠，根据权限动态渲染菜单）
- 顶部用户信息栏（面包屑导航 + 下拉菜单）
- 首页统计卡片（角色数 / 权限数 / 菜单数 / 账号状态）

### 系统管理
- **用户管理**：增删改查、关键字搜索、分页、分配角色
- **角色管理**：增删改查、树形权限配置（支持连带子节点勾选）
- **权限管理**：树形结构展示、支持菜单/按钮/API 三种类型

## 默认账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | 123456 | 超级管理员 | 所有权限 |
| manager | 123456 | 管理员 | 部分权限 |
| user | 123456 | 普通用户 | 只读 |

## API 接口

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 用户管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 获取用户列表（分页） |
| GET | `/api/users/:id` | 获取用户详情 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |

### 角色管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles` | 获取角色列表 |
| GET | `/api/roles/:id` | 获取角色详情 |
| POST | `/api/roles` | 创建角色 |
| PUT | `/api/roles/:id` | 更新角色 |
| DELETE | `/api/roles/:id` | 删除角色 |

### 权限管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/permissions` | 获取权限列表 |
| GET | `/api/permissions/tree` | 获取权限树 |
| GET | `/api/permissions/:id` | 获取权限详情 |
| POST | `/api/permissions` | 创建权限 |
| PUT | `/api/permissions/:id` | 更新权限 |
| DELETE | `/api/permissions/:id` | 删除权限 |

---

## 部署步骤（macOS）

### 1. 安装前置依赖

#### 1.1 安装 Homebrew（如已安装可跳过）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装完成后，根据终端提示将 Homebrew 添加到 PATH（Apple Silicon Mac 通常需要执行）：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

验证安装：

```bash
brew --version
```

#### 1.2 安装 Node.js

```bash
brew install node@22
```

验证安装：

```bash
node -v   # 应输出 v22.x.x
npm -v    # 应输出 10.x.x
```

#### 1.3 安装 PostgreSQL 18

```bash
brew install postgresql@18
```

启动 PostgreSQL 服务并设为开机自启：

```bash
brew services start postgresql@18
```

验证 PostgreSQL 正在运行：

```bash
brew services info postgresql@18
# 应显示 status 为 started
```

#### 1.4 验证 Git（macOS 自带，如无则安装）

```bash
git --version
# 若提示安装命令行工具，按提示安装即可
```

### 2. 克隆项目

```bash
cd ~
git clone <项目仓库地址> admin-system
cd admin-system
```

### 3. 配置数据库

#### 3.1 创建数据库用户和数据库

macOS 上通过 Homebrew 安装的 PostgreSQL 默认以当前系统用户名作为超级用户，无需密码即可本地连接。如果需要单独的数据库用户，执行以下步骤：

```bash
# 以默认用户连接 PostgreSQL
psql postgres
```

在 psql 交互界面中执行：

```sql
-- 创建数据库用户（如需密码认证）
CREATE USER admin_user WITH PASSWORD 'your_password';

-- 创建数据库并指定所有者
CREATE DATABASE admin_db OWNER admin_user;

-- 授予全部权限
GRANT ALL PRIVILEGES ON DATABASE admin_db TO admin_user;

-- 退出
\q
```

> 如果使用默认用户（无密码），连接字符串为：
> `postgresql://localhost:5432/admin_db?schema=public`

### 4. 配置环境变量

#### 4.1 数据库环境变量（db/）

```bash
cd db
cp .env.example .env
```

编辑 `db/.env`，填入你的数据库连接信息：

```bash
# 使用密码认证的用户
DATABASE_URL="postgresql://admin_user:your_password@localhost:5432/admin_db?schema=public"

# 或使用默认用户（无密码）
# DATABASE_URL="postgresql://localhost:5432/admin_db?schema=public"
```

#### 4.2 后端环境变量（backend/）

```bash
cd ../backend
cp .env.example .env
```

编辑 `backend/.env`：

```env
PORT=4000
DATABASE_URL="postgresql://admin_user:your_password@localhost:5432/admin_db?schema=public"
JWT_SECRET=admin_system_secret_key_2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

> **注意**：`DATABASE_URL` 必须与 `db/.env` 中的保持一致。

#### 4.3 前端环境变量（frontend/）

```bash
cd ../frontend
cp .env.example .env.local
```

编辑 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 5. 初始化数据库

```bash
cd ../db

# 安装数据库包依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移（创建表结构）
npx prisma migrate dev --name init

# 执行种子脚本（初始化权限、角色、用户数据）
npm run seed
```

执行成功后会看到类似输出：

```
✅ 权限数据初始化完成
✅ 超级管理员角色创建完成
✅ 管理员角色创建完成
✅ 普通用户角色创建完成
✅ 超级管理员用户创建完成 (admin / 123456)
✅ 管理员用户创建完成 (manager / 123456)
✅ 普通用户创建完成 (user / 123456)
🎉 数据库初始化完成！
```

### 6. 启动后端服务

```bash
cd ../backend

# 安装后端依赖
npm install

# 生成 Prisma Client（指向 db/ 目录中的 schema）
npm run prisma:generate

# 启动开发服务器
npm run dev
```

后端服务启动成功后，终端会显示：

```
✅ 数据库连接成功
🚀 服务运行在 http://localhost:4000
📚 API 文档前缀: /api
```

可访问健康检查接口验证：在浏览器中打开 http://localhost:4000/api/health

### 7. 启动前端服务

```bash
# 新开一个终端窗口
cd ~/admin-system/frontend

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动成功后，终端会显示：

```
- Local: http://localhost:3000
```

### 8. 访问系统

打开浏览器访问：**http://localhost:3000**

使用默认账号登录：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |
| manager | 123456 | 管理员 |
| user | 123456 | 普通用户 |

### 9. 停止服务

- **后端**：在运行 `npm run dev` 的终端按 `Ctrl + C`
- **前端**：在运行 `npm run dev` 的终端按 `Ctrl + C`
- **PostgreSQL**（如需停止）：`brew services stop postgresql@18`

---

## 常用命令速查

| 操作 | 目录 | 命令 |
|------|------|------|
| 数据库迁移 | db/ | `npx prisma migrate dev --name <迁移名>` |
| 数据库重置 | db/ | `npx prisma migrate reset` |
| 重新填充种子数据 | db/ | `npm run seed` |
| 打开 Prisma Studio | db/ | `npx prisma studio` |
| 后端生成 Prisma Client | backend/ | `npm run prisma:generate` |
| 后端开发模式 | backend/ | `npm run dev` |
| 后端构建 | backend/ | `npm run build` |
| 前端开发模式 | frontend/ | `npm run dev` |
| 前端构建 | frontend/ | `npm run build` |
