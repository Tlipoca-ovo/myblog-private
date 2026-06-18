---
name: 实验部署流程
description: 在 E:\myblog 进行实验部署，发现问题后在主项目修复并同步，最后更新实验文件夹
metadata:
  type: project
---

# 实验部署工作流程

## 目录结构

| 路径 | 用途 |
|------|------|
| `E:\ai-web\博客模版` | 主项目（GitHub 同步源） |
| `E:\myblog` | 实验部署文件夹 |

## 工作流程

### 第一阶段：实验部署

1. **Clone 项目到实验文件夹**
   ```bash
   cd E:\myblog
   git clone https://github.com/Tlipoca-ovo/blog-template.git .
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **初始化数据库**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **本地开发测试**
   ```bash
   npm run dev
   ```
   - 访问 http://localhost:3000 检查前台
   - 访问 http://localhost:3000/admin 检查后台

5. **Cloudflare 部署测试**
   - 按照 README/DEPLOY.md 部署到 Cloudflare
   - 观察生产环境问题

### 第二阶段：问题修复与同步

如果发现问题：

1. **切换到主项目**
   ```bash
   cd E:\ai-web\博客模版
   ```

2. **在主项目中修复问题**

3. **同步到 GitHub**
   ```bash
   git add .
   git commit -m "修复: 描述修复内容"
   git push origin main
   ```

### 第三阶段：更新实验文件夹

修复同步完成后，更新实验文件夹：

1. **拉取最新代码**
   ```bash
   cd E:\myblog
   git pull origin main
   ```

2. **重新构建/部署**
   ```bash
   npm run build:cloudflare
   npm run deploy:cloudflare
   ```

## 当前状态

### 主项目 (E:\ai-web\博客模版)
- 分支: main
- 最新提交: `6114b5d` - 重构: 认证系统迁移至 middleware
- 已同步到 GitHub

### 实验文件夹 (E:\myblog)
- 尚未创建

## 注意事项

- **修改代码只在主项目进行**
- **实验文件夹仅用于观察和验证**
- **所有修复必须通过 GitHub 同步**
- **确认主项目无误后再更新实验文件夹**
