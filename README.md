# Hiring Management System (Employee Management Project)

一个面向员工与 HR 的入职管理系统，覆盖注册、入职申请、文件上传、签证流程与 HR 审核。

## 技术栈

### 前端
- React 18 + Vite
- Redux Toolkit + React-Redux
- React Router v6
- Ant Design
- Axios

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 鉴权
- Nodemailer（邮件）
- Multer（文件上传）

## 主要功能

### 员工侧
- Token 注册（邮箱锁定）
- 登录与会话保持
- 入职申请（草稿保存 / 提交 / 只读）
- 个人信息分区编辑（编辑/保存/取消）
- 真实文件上传 + 预览/下载
- 签证流程（F1 OPT）分步上传与状态反馈

### HR 侧
- 注册 Token 生成 + 邮件发送
- 入职申请审核（查看/批准/拒绝/反馈）
- Employee Profiles 搜索与详情
- Visa 管理（In Progress/All、预览/下载、批准/拒绝/提醒）

## 项目结构（实际）

```
Hiring_Management_System/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── routes/
│       ├── store/
│       └── api/
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   └── utils/
    ├── uploads/
    └── scripts/
```

## 环境变量

在 `server/.env` 配置：

```env
MONGODB_URI=mongodb://localhost:27017/hiring_management
JWT_SECRET=your_jwt_secret

# 邮件发送（可选，未配置则 console.log）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# 前端地址（生成注册链接）
FRONTEND_URL=http://localhost:5173

# Seed 文件 URL 前缀（可选）
SEED_FILE_BASE_URL=http://localhost:5050/uploads
```

前端可选：

```env
VITE_FILE_BASE_URL=http://localhost:5050/uploads
```

## 启动方式

### 1) 安装依赖

```bash
cd server
npm install

cd ../client
npm install
```

### 2) 启动服务

```bash
cd server
npm run dev
```
后端默认运行在 `http://localhost:5050`。

```bash
cd client
npm run dev
```
前端默认运行在 `http://localhost:5173`。

## Seed 数据

```bash
cd server
npm run seed
# 或
npm run seed:summary
```

Seed 会清空数据库并写入演示数据与示例文件（位于 `server/uploads`）。

### 默认账号（seedAll）

- HR: `adminHR / Test123!`
- HR: `reviewHR / Test123!`
- 员工：`f1_user1 / Test123!` 等

## 文件上传说明

- 文件存储在 `server/uploads` 目录
- MongoDB 仅保存文件 URL
- 访问路径形如 `http://localhost:5050/uploads/xxx.pdf`

## 关键路由

- `/register?token=...` 员工注册
- `/login` 登录
- `/onboarding` 入职申请
- `/dashboard` 员工主页
- `/hr` HR 主页
- `/hr/onboarding/:id` HR 查看入职详情

## 已知说明

- 未配置 SMTP 时，邮件发送会输出到 console（便于本地调试）。
- 如需正式邮件发送，请配置 SMTP 环境变量。

