# Hiring Management System (Employee Management Project)

一个完整的员工招聘和入职管理系统，支持员工注册、入职申请、文件上传以及 HR 管理功能。

## 技术栈

### 前端 (Client)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Redux + Redux Toolkit
- **UI 组件库**: Ant Design
- **样式**: Tailwind CSS (与 Ant Design 共存)
- **路由**: React Router v6
- **HTTP 客户端**: Axios

### 后端 (Server)
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **邮件服务**: Nodemailer (推荐使用 Gmail SMTP)
- **文件上传**: Multer

## 项目结构

```
Hiring_Management_System/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── common/        # 通用组件
│   │   │   ├── employee/      # 员工组件
│   │   │   └── hr/            # HR 组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── auth/          # 登录/注册页面
│   │   │   ├── employee/      # 员工页面
│   │   │   └── hr/            # HR 页面
│   │   ├── store/             # Redux store
│   │   │   ├── slices/        # Redux slices
│   │   │   ├── store.ts       # Store 配置
│   │   │   └── hooks.ts       # 类型化的 hooks
│   │   ├── services/          # API 服务
│   │   ├── utils/             # 工具函数
│   │   ├── types/             # TypeScript 类型
│   │   └── assets/            # 静态资源
│   ├── package.json
│   └── vite.config.ts
│
└── server/                    # 后端项目You okay? Okay?
    ├── src/
    │   ├── config/            # 配置文件
    │   │   └── database.js    # MongoDB 连接
    │   ├── controllers/       # 控制器
    │   ├── models/            # Mongoose 模型
    │   │   └── User.js        # 用户模型
    │   ├── routes/            # 路由
    │   ├── middleware/        # 中间件
    │   ├── utils/             # 工具函数
    │   │   └── emailService.js # 邮件服务
    │   ├── uploads/           # 文件上传目录
    │   └── index.js           # 服务器入口
    ├── .env                   # 环境变量
    ├── .env.example           # 环境变量示例
    └── package.json
```

## 快速开始

### 前置要求
- Node.js (v18 或更高版本)
- MongoDB (本地安装或使用 MongoDB Atlas)
- Gmail 账号 (用于发送邮件)

### 1. 安装依赖

#### 安装后端依赖
```bash
cd server
npm install
```

#### 安装前端依赖
```bash
cd client
npm install
```

### 2. 配置环境变量

编辑 `server/.env` 文件，填入你的配置：

```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/hiring_management

# JWT 密钥 (生产环境请使用强密码)
JWT_SECRET=your_super_secret_jwt_key_here

# Gmail 配置
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# 前端 URL
CLIENT_URL=http://localhost:5173
```

#### 获取 Gmail 应用专用密码

1. 登录 Google 账号
2. 访问：https://myaccount.google.com/apppasswords
3. 选择"邮件"和"其他设备"
4. 生成 16 位密码
5. 复制到 `.env` 文件的 `EMAIL_PASSWORD`

### 3. 启动 MongoDB

确保 MongoDB 正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# 或者直接运行
mongod
```

### 4. 运行项目

#### 启动后端服务器
```bash
cd server
npm run dev
```
服务器将运行在：http://localhost:5000

#### 启动前端开发服务器
```bash
cd client
npm run dev
```
前端将运行在：http://localhost:5173

## 已完成的工作 ✅

### 前端 (Client)
- ✅ **React + Vite + TypeScript** 项目初始化
- ✅ **Ant Design** UI 组件库配置
- ✅ **Tailwind CSS** 样式框架配置（与 Ant Design 共存，避免 CSS 全局污染）
- ✅ **Redux + Redux Toolkit** 状态管理设置
- ✅ **项目目录结构**：
  - `components/` - 可复用组件（common/employee/hr）
  - `pages/` - 页面组件（auth/employee/hr）
  - `store/` - Redux store 和 slices（authSlice, employeeSlice）
  - `services/` - API 服务
  - `utils/` - 工具函数
  - `types/` - TypeScript 类型定义

### 后端 (Server)
- ✅ **Node.js + Express** 服务器初始化
- ✅ **MongoDB + Mongoose** 数据库配置
- ✅ **Nodemailer** 邮件服务配置（Gmail SMTP）
- ✅ **JWT 认证** 依赖安装（bcryptjs, jsonwebtoken）
- ✅ **文件上传** (Multer) 配置
- ✅ **项目目录结构**：
  - `config/` - 配置文件（数据库连接已配置）
  - `models/` - Mongoose 数据模型（User 模型已创建）
  - `controllers/` - 业务逻辑控制器
  - `routes/` - API 路由
  - `middleware/` - 中间件
  - `utils/` - 工具函数（邮件服务已创建）
  - `uploads/` - 文件上传目录

### 关键文件已配置
- ✅ **Redux Store** 配置完成（authSlice, employeeSlice）
- ✅ **Tailwind 配置** - 与 Ant Design 共存，禁用 preflight 避免样式冲突
- ✅ **MongoDB 连接** 配置（database.js）
- ✅ **邮件服务** 配置（支持注册邮件和通知邮件）
- ✅ **User 数据模型** 创建（包含密码加密和验证方法）
- ✅ **环境变量** 配置（.env 和 .env.example）
- ✅ **Express 服务器** 基础配置（CORS, body-parser, 静态文件）

### 技术栈选型总结

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| **UI 组件库** | Ant Design | 企业级组件库，功能丰富 |
| **样式方案** | Tailwind CSS | 原子化 CSS，避免全局污染 |
| **状态管理** | Redux + Redux Toolkit | 使用 createSlice 简化开发 |
| **邮件服务** | Nodemailer | 支持 Gmail SMTP，免费无限制 |
| **数据库** | MongoDB + Mongoose | NoSQL 数据库，灵活的数据模型 |
| **认证方式** | JWT | 无状态认证，适合前后端分离 |

## 待实现功能

### 1. 认证系统
- [ ] 创建 auth 路由和控制器
- [ ] 实现 JWT token 验证中间件
- [ ] 实现登录/注册 API
- [ ] 前端登录/注册页面

### 2. 员工功能
- [ ] 创建 Employee 模型（个人信息、地址、工作授权等）
- [ ] 实现入职申请表单（Ant Design Form）
- [ ] 实现文件上传功能（Multer）
- [ ] 个人信息编辑页面
- [ ] 签证状态管理页面

### 3. HR 功能
- [ ] 生成注册 token API
- [ ] 发送注册邮件
- [ ] 审核入职申请 API
- [ ] 员工档案管理页面
- [ ] 签证文件审核页面

### 4. 其他功能
- [ ] 表单验证（前端 + 后端）
- [ ] 错误处理中间件
- [ ] 文件预览功能
- [ ] 数据可视化（可选）

## 下一步开发建议

### 优先级 1：认证系统
1. 创建 `authController.js` 和 `authRoutes.js`
2. 实现 JWT 中间件 `authMiddleware.js`
3. 前端创建登录/注册页面

### 优先级 2：数据模型
1. 创建 `Employee.js` 模型
2. 创建 `OnboardingApplication.js` 模型
3. 创建 `Document.js` 模型

### 优先级 3：核心功能
1. 实现入职申请流程
2. 实现文件上传和管理
3. 实现 HR 审核功能

## 功能特性（项目需求）

### 员工功能
- 用户注册 (需要 HR 生成的注册 token)
- 用户登录/登出
- 入职申请提交
  - 个人信息填写
  - 地址信息
  - 工作授权信息
  - 紧急联系人
  - 文件上传 (驾照、工作授权文件等)
- 个人信息管理 (可编辑)
- 签证状态管理 (OPT 流程)

### HR 功能
- 生成注册 token 并发送邮件
- 查看所有员工档案
- 搜索员工
- 入职申请审核
- 签证文件管理

## 常见问题

### MongoDB 连接失败
- 确保 MongoDB 服务正在运行
- 检查 `.env` 中的 `MONGODB_URI` 配置

### 邮件发送失败
- 确认 Gmail 应用专用密码正确
- 检查 Google 账号是否开启了两步验证

## 许可证

本项目仅用于学习目的。
