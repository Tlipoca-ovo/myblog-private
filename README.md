# 博客模版

基于 Next.js + Prisma + Cloudflare D1 的高度可自定义博客系统。

## 功能特性

- **前台展示**：首页、文章详情、分类、标签、页面、关于、友链
- **管理后台**：完整的博客管理后台（需管理员登录）
- **高度可自定义**：通过后台可自定义主题色彩、模块开关、导航菜单、SEO 等
- **富文本编辑**：使用 Tiptap 编辑器撰写文章
- **轻量部署**：使用 SQLite/D1 数据库，无需额外部署数据库服务

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 数据库 | Prisma ORM + SQLite (本地) / Cloudflare D1 (生产) |
| 编辑器 | Tiptap |
| 认证 | JWT |
| 部署 | Cloudflare Pages |

## 环境要求

- Node.js 20+
- npm 10+

## 安装部署

### 1. 克隆项目

```bash
git clone https://github.com/Tlipoca-ovo/blog-template.git
cd blog-template
npm install
```

### 2. 配置环境变量

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要修改以下变量：

```env
# 本地开发（SQLite）
DATABASE_URL=file:dev.db

# JWT 密钥（本地开发）
JWT_SECRET=dev-secret-local

# 初始化管理员密码
ADMIN_PASSWORD=admin123
```

> **提示**：生产环境请使用 `openssl rand -hex 32` 生成安全的 JWT 密钥。

### 3. 初始化数据库

首次克隆后需要初始化数据库和 Prisma 客户端：

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构到本地 SQLite
npx prisma db push

# 播种初始数据（管理员账户、示例文章等）
npx prisma db seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看博客前台。
管理后台位于 [http://localhost:3000/admin](http://localhost:3000/admin)。

默认管理员账户：`admin` / `admin123`（可在 `.env` 中通过 `ADMIN_PASSWORD` 修改）。

---

## 生产环境部署（Cloudflare Pages）

### 1. 创建 Cloudflare D1 数据库

登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，创建一个 D1 数据库。

### 2. 配置 wrangler.toml

编辑项目根目录的 `wrangler.toml`（需自行创建，参考模板）：

```toml
name = "blog-template-api"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[vars]
JWT_SECRET = { default = "", description = "使用 `wrangler secret put JWT_SECRET` 设置" }
DATABASE_URL = "libsql://<account-id>.cloudflare.com/<database-name>"
DATABASE_AUTH_TOKEN = ""

[[d1_databases]]
binding = "blog_template_db"
database_name = "<你的数据库名称>"
database_id = "<你的数据库 ID>"
```

> **注意**：`wrangler.toml` 包含敏感信息，请勿将其提交到公共仓库。已通过 `.gitignore` 排除。

### 3. 设置环境变量

在 Cloudflare Pages Dashboard 中配置以下环境变量：

| 变量名 | 说明 |
|--------|------|
| `JWT_SECRET` | JWT 密钥，使用 `openssl rand -hex 32` 生成 |
| `DATABASE_URL` | D1 数据库地址（格式：`libsql://<account-id>.cloudflare.com/<database-name>`） |
| `DATABASE_AUTH_TOKEN` | Cloudflare API Token |

### 4. 推送数据库结构

```bash
npx wrangler d1 migrations apply blog-template-db --remote
```

### 5. 部署到 Cloudflare Pages

方式一：通过 GitHub 集成（推荐）

1. 将项目推送到 GitHub
2. 在 Cloudflare Pages 中选择 GitHub 仓库进行部署
3. 构建命令：`npm run build:cloudflare`
4. 输出目录：`.next`

方式二：手动部署

```bash
npm run build:cloudflare
npx wrangler pages deploy .next --project-name=blog-template
```

---

## 项目结构

```
├── prisma/               # Prisma schema 和种子脚本
│   ├── schema.prisma    # 数据库模型定义
│   └── seed.ts          # 数据库播种脚本
├── src/
│   ├── app/             # Next.js App Router 页面
│   │   ├── admin/      # 管理后台
│   │   └── api/         # API 路由
│   ├── components/       # React 组件
│   ├── lib/             # 工具函数（数据库、认证等）
│   └── middleware/       # 中间件（管理员认证等）
├── public/              # 静态资源
├── .env.example          # 环境变量模板
├── wrangler.toml         # Cloudflare Pages 部署配置
└── next.config.ts        # Next.js 配置
```

---

## 数据库模型

- **AdminUser**：管理员账户
- **Post**：文章
- **Category**：分类
- **Tag**：标签
- **Comment**：评论
- **Page**：自定义页面
- **FriendLink**：友链
- **SiteSettings**：站点配置（主题、模块、SEO 等）
- **Config**：配置项（导航、主题模块等）

---

## 许可证

MIT
