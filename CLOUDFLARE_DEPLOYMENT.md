# Cloudflare Pages 部署指南

本文档介绍如何将 ReflexX 网站通过 Cloudflare Pages 部署到 reflexx.uk 域名。

## 前置准备

- ✅ Gitee 仓库（已有代码）
- ✅ Cloudflare 账号（免费）
- ✅ 域名：reflexx.uk（已在 Cloudflare 或其他注册商）

## 部署方案

Cloudflare Pages 支持多种部署方式，推荐以下方案：

### 方案 A：直接推送代码到 Cloudflare（最简单）

适合：不想连接 Git 仓库，直接上传构建后的文件

#### 步骤 1：本地构建

```bash
cd /Users/zeng/Desktop/reaction-time-test

# 设置生产环境变量
export NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY
export NEXT_PUBLIC_SITE_URL=https://reflexx.uk
export RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
export CONTACT_EMAIL=jackyzeng1234@gmail.com

# 构建项目
npm run build

# 导出静态文件（如果使用静态导出）
# npm run export
```

#### 步骤 2：上传到 Cloudflare Pages

1. 登录 Cloudflare Dashboard：https://dash.cloudflare.com/
2. 选择 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Upload assets**
6. 项目名称：`reflexx-website`
7. 拖拽构建后的文件夹（通常是 `.next` 或 `out` 目录）

⚠️ **注意**：Next.js 默认是服务器端渲染，需要特殊配置。推荐使用方案 B。

---

### 方案 B：使用 Cloudflare Pages + Wrangler CLI（推荐）

适合：完整的 Next.js 功能，包括 API Routes

#### 步骤 1：安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 步骤 2：登录 Cloudflare

```bash
wrangler login
```

会打开浏览器进行授权。

#### 步骤 3：创建配置文件

创建 `wrangler.toml`：

```toml
name = "reflexx-website"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

# 环境变量（在 Cloudflare Dashboard 配置更安全）
# [vars]
# NEXT_PUBLIC_SITE_URL = "https://reflexx.uk"
```

#### 步骤 4：部署

```bash
cd /Users/zeng/Desktop/reaction-time-test

# 构建并部署
wrangler pages project create reflexx-website
wrangler pages deploy .next --project-name=reflexx-website
```

---

### 方案 C：通过 GitHub 同步（最推荐）

Cloudflare Pages 与 GitHub 集成最好，虽然你的代码在 Gitee，但可以：

#### 步骤 1：将 Gitee 仓库镜像到 GitHub

1. 在 GitHub 创建新仓库：`reflexx-website`
2. 在 Gitee 设置中添加 GitHub 远程仓库
3. 或使用 GitHub 的导入功能：https://github.com/new/import

```bash
# 添加 GitHub 远程仓库
cd /Users/zeng/Desktop/reaction-time-test
git remote add github https://github.com/YOUR_USERNAME/reflexx-website.git

# 推送到 GitHub
git push github main
```

#### 步骤 2：在 Cloudflare Pages 连接 GitHub

1. 登录 Cloudflare Dashboard
2. **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 选择 GitHub 仓库：`reflexx-website`
5. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`

6. 配置环境变量（Environment Variables）：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_SITE_URL=https://reflexx.uk
   RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
   CONTACT_EMAIL=jackyzeng1234@gmail.com
   ```

7. 点击 **Save and Deploy**

---

## 配置自定义域名

### 方案 1：域名已在 Cloudflare

如果 `reflexx.uk` 的 DNS 托管在 Cloudflare：

1. 在 Cloudflare Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入：`reflexx.uk`
4. Cloudflare 会自动配置 DNS：
   - 自动添加 CNAME 记录
   - 自动配置 SSL/TLS

### 方案 2：域名在其他注册商

如果 `reflexx.uk` 在其他注册商（如 GoDaddy、Namecheap）：

1. 在 Cloudflare Pages 添加自定义域名：`reflexx.uk`
2. Cloudflare 提供目标地址（例如：`reflexx-website.pages.dev`）
3. 在域名注册商配置 DNS：

```
Type: CNAME
Name: @
Value: reflexx-website.pages.dev
TTL: 3600
```

或者使用 A 记录：
```
Type: A
Name: @
Value: 172.66.40.249  # Cloudflare Pages IP
TTL: 3600
```

---

## 环境变量配置

在 Cloudflare Pages Dashboard 配置：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://axertwlypazfplajfwjt.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://reflexx.uk` | Production |
| `RESEND_API_KEY` | `re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P` | Production |
| `CONTACT_EMAIL` | `jackyzeng1234@gmail.com` | Production |

---

## 重要配置：Next.js on Cloudflare Pages

Next.js 默认需要 Node.js 运行时，Cloudflare Pages 使用 Edge Runtime。需要修改配置：

### 1. 创建 `next.config.js`

确保项目根目录有正确的配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 静态导出
  images: {
    unoptimized: true,  // Cloudflare Pages 需要
  },
  trailingSlash: true,
};

module.exports = nextConfig;
```

### 2. 修改 API Routes 为 Edge Functions

或者，使用 Cloudflare Pages Functions 处理 API。

---

## 推荐方案：静态导出（最简单）

如果你的网站不需要复杂的 API Routes，可以使用静态导出：

### 步骤 1：修改 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
```

### 步骤 2：构建并上传

```bash
# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 构建
npm run build

# 上传 out 文件夹到 Cloudflare Pages
# wrangler pages deploy out --project-name=reflexx-website
```

⚠️ **注意**：静态导出不支持 API Routes（如 `/api/contact`）。Contact 功能需要使用第三方服务或改为客户端表单。

---

## 故障排查

### 1. API Routes 不工作

**问题**：Cloudflare Pages 静态部署不支持 Next.js API Routes

**解决方案**：
- 使用 Cloudflare Pages Functions
- 或将 Contact 表单改用 Formspree/Getform 等服务

### 2. 环境变量未生效

**检查**：
- 在 Cloudflare Dashboard 确认环境变量已添加
- 确认选择了正确的环境（Production）
- 重新部署项目

### 3. 图片不显示

**原因**：Next.js Image Optimization 在静态导出中需要特殊配置

**解决**：已在 `next.config.js` 中添加 `unoptimized: true`

### 4. 域名无法访问

**检查**：
1. DNS 配置是否正确
2. Cloudflare SSL/TLS 设置（建议使用 Full 模式）
3. 等待 DNS 生效（5-30 分钟）

---

## 验证部署

部署成功后：

- ✅ 访问 https://reflexx.uk 显示网站
- ✅ 所有测试功能正常
- ✅ Supabase 数据库连接正常
- ⚠️ Contact 表单可能需要额外配置

---

## 自动部署

如果使用 GitHub 同步：

1. 每次推送代码到 GitHub 主分支
2. Cloudflare Pages 自动检测并重新部署
3. 通常 1-2 分钟完成

```bash
git add .
git commit -m "更新网站"
git push github main
```

---

## 成本

- Cloudflare Pages：**免费**
  - 无限带宽
  - 无限请求
  - 全球 CDN
  - 自动 SSL

---

## 下一步

部署完成后：

1. 测试所有功能
2. 配置邮件服务（Contact 表单）
3. 设置 Google Analytics
4. 提交到搜索引擎（Google Search Console）
5. 优化性能（Cloudflare 自动优化）

---

## 参考文档

- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- Next.js 部署：https://nextjs.org/docs/deployment
- Wrangler CLI：https://developers.cloudflare.com/workers/wrangler/

---

**需要帮助？**
- Cloudflare 社区：https://community.cloudflare.com/
- Next.js Discord：https://discord.gg/nextjs
