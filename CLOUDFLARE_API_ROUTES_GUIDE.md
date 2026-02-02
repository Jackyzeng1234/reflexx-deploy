# Cloudflare Pages 部署指南 - 完整 API Routes 支持

本文档介绍如何使用 `@cloudflare/next-on-pages` 适配器将 ReflexX 部署到 Cloudflare Pages，**完全支持 API Routes**。

## 🎯 为什么选择这个方案？

### 与其他方案对比

| 功能 | Vercel | Cloudflare + @cloudflare/next-on-pages | Cloudflare 静态导出 |
|------|--------|----------------------------------------|-------------------|
| API Routes | ✅ 支持 | ✅ 支持 | ❌ 不支持 |
| SSR | ✅ 支持 | ✅ 支持 | ❌ 不支持 |
| Contact 表单 | ✅ 正常 | ✅ 正常 | ❌ 需要修改 |
| 代码修改 | ❌ 无需修改 | ❌ 无需修改 | ✅ 需要大量修改 |
| 部署难度 | ⭐ 极简 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| 成本 | 免费套餐 | **完全免费** | 免费套餐 |
| 速度 | ⚡ 极快 | ⚡⚡ 最快（边缘网络） | ⚡⚡ 最快 |

**结论**：这是 Cloudflare Pages 上支持 Next.js API Routes 的**最佳方案**！

---

## 📋 部署步骤

### 第一步：安装依赖

```bash
cd /Users/zeng/Desktop/reaction-time-test

# 安装 Cloudflare Next.js 适配器
npm install -D @cloudflare/next-on-pages
```

### 第二步：构建项目

**方式 1：使用构建脚本（推荐）**

```bash
# 运行构建脚本
./scripts/build-cloudflare.sh
```

**方式 2：手动构建**

```bash
# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 构建 Next.js
npm run build

# 适配 Cloudflare Pages
npx @cloudflare/next-on-pages
```

**构建输出**：
```
✓ Compiled successfully
✓ Built in 2.5s
📁 Output: .vercel/output/static
```

### 第三步：登录 Cloudflare

```bash
# 登录 Cloudflare
wrangler login
```

浏览器会打开，点击 "Authorize Wrangler"。

### 第四步：创建项目

```bash
# 创建 Cloudflare Pages 项目
wrangler pages project create reflexx-website --production-branch=main
```

### 第五步：部署

```bash
# 部署到 Cloudflare Pages
wrangler pages deploy .vercel/output/static --project-name=reflexx-website
```

**部署输出**：
```
✨ Successfully created deployment 'reflexx-website-xxxxxxxx'
✨ Uploaded 500+ files
✨ Deployment URL: https://xxxxxxxx.reflexx-website.pages.dev
```

---

## 🌐 配置自定义域名

### 方法 1：域名已在 Cloudflare（推荐）

```bash
# 添加自定义域名
wrangler pages project domain reflexx.uk --project-name=reflexx-website
```

Cloudflare 会自动配置 DNS 和 SSL。

### 方法 2：域名在其他注册商

1. 在 Cloudflare Dashboard 添加域名：
   - Workers & Pages → reflexx-website → Custom domains
   - Add domain: `reflexx.uk`

2. 在域名注册商添加 DNS：
   ```dns
   Type: CNAME
   Name: @
   Value: reflexx-website.pages.dev
   TTL: 3600
   ```

3. 等待 DNS 生效（5-30 分钟）

---

## ⚙️ 配置环境变量

### 方法 1：通过 Cloudflare Dashboard（推荐）

1. 进入项目 → Settings → Environment variables
2. 添加以下变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://axertwlypazfplajfwjt.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   NEXT_PUBLIC_SITE_URL
   https://reflexx.uk

   RESEND_API_KEY
   re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P

   CONTACT_EMAIL
   jackyzeng1234@gmail.com
   ```

3. 保存后重新部署

### 方法 2：通过 wrangler

创建 `wrangler.toml`：

```toml
name = "reflexx-website"
compatibility_date = "2024-01-01"

[env.production.vars]
NEXT_PUBLIC_SUPABASE_URL = "https://axertwlypazfplajfwjt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGci..."
NEXT_PUBLIC_SITE_URL = "https://reflexx.uk"
RESEND_API_KEY = "re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P"
CONTACT_EMAIL = "jackyzeng1234@gmail.com"
```

---

## 🔄 自动部署（推荐）

### 通过 GitHub 自动部署

1. **推送代码到 GitHub**

```bash
# 初始化 git（如果还没有）
git init
git add .
git commit -m "ReflexX - 准备部署到 Cloudflare Pages"

# 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/reflexx.git
git push -u origin main
```

2. **在 Cloudflare Pages 连接 GitHub**

   - Dashboard → Workers & Pages → Create → Connect to Git
   - 选择 GitHub 仓库：`reflexx`
   - 配置构建设置：
     ```
     Framework preset: Next.js
     Build command: npm install && npm run build && npx @cloudflare/next-on-pages
     Build output directory: .vercel/output/static
     Root directory: /
     ```
   - 添加环境变量（见上面）

3. **自动部署**
   - 每次推送代码到 GitHub
   - Cloudflare 自动构建并部署

---

## 🧪 测试功能

部署后访问 https://reflexx.uk，测试：

### ✅ 基础功能
- [ ] 首页正常显示
- [ ] 所有测试页面可以访问
- [ ] Navigation 导航正常

### ✅ API Routes（重要！）
- [ ] Contact 表单可以提交
- [ ] jackyzeng1234@gmail.com 收到邮件
- [ ] 成绩提交到 Supabase 成功
- [ ] 排行榜显示真实数据

### ✅ 用户认证
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以登出
- [ ] 个人资料页面正常

---

## 🔍 工作原理

### `@cloudflare/next-on-pages` 做了什么？

1. **转换 API Routes**
   ```
   /api/contact → Cloudflare Pages Function
   /api/scores  → Cloudflare Pages Function
   ```

2. **适配 Server-Side Rendering**
   ```
   Next.js SSR → Cloudflare Edge Function
   ```

3. **优化静态资源**
   ```
   图片、CSS、JS → Cloudflare CDN
   ```

### 架构对比

**传统 Vercel**：
```
用户请求 → Vercel Edge → Next.js Server → API Routes
```

**Cloudflare + @cloudflare/next-on-pages**：
```
用户请求 → Cloudflare Edge → Cloudflare Pages Function → API Routes
```

两者功能完全相同，但 Cloudflare 使用边缘网络，速度更快！

---

## 📊 性能优化

### 已启用的优化

- ✅ **静态资源缓存** - Cloudflare 自动缓存
- ✅ **全球 CDN** - 300+ 数据中心
- ✅ **HTTP/3** - 自动启用
- ✅ **Brotli 压缩** - 自动启用
- ✅ **Image Optimization** - 已禁用（使用 `unoptimized`）

### 可选优化

#### 1. 启用 Cloudflare Images（可选）

```toml
# wrangler.toml
[images]
binding = "IMAGES"
```

#### 2. 配置 KV 存储（缓存）

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 🚨 故障排查

### 问题 1：构建失败

**错误**：`Cannot find module '@cloudflare/next-on-pages'`

**解决**：
```bash
npm install -D @cloudflare/next-on-pages
```

### 问题 2：API Routes 返回 404

**原因**：未正确适配 API Routes

**解决**：
```bash
# 确保运行了适配命令
npx @cloudflare/next-on-pages
```

### 问题 3：环境变量未生效

**解决**：
1. 确认在 Cloudflare Dashboard 添加了环境变量
2. 重新部署项目
3. 检查环境变量名称是否正确

### 问题 4：图片不显示

**原因**：Next.js Image Optimization 未禁用

**解决**：已配置 `unoptimized: true`

### 问题 5：Supabase 连接失败

**错误**：`CORS policy blocked`

**解决**：在 Supabase Dashboard 添加 Cloudflare 域名到允许列表

---

## 📈 监控和日志

### Cloudflare Dashboard

1. **查看部署日志**
   - Workers & Pages → reflexx-website → Deployments
   - 查看构建历史

2. **查看函数日志**
   - Workers & Pages → reflexx-website → Functions
   - 查看 API Routes 执行日志

3. **查看分析数据**
   - Analytics → Pages
   - 查看请求量、带宽、错误率

### 实时日志

```bash
# 实时查看函数日志
wrangler pages deployment tail --project-name=reflexx-website
```

---

## 💡 最佳实践

### 1. 环境变量管理

创建 `.env.cloudflare`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://reflexx.uk
RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
CONTACT_EMAIL=jackyzeng1234@gmail.com
```

构建时加载：
```bash
export $(cat .env.cloudflare | xargs)
npm run build
```

### 2. 自动化部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署 ReflexX..."

# 加载环境变量
export $(cat .env.cloudflare | xargs)

# 构建
./scripts/build-cloudflare.sh

# 部署
wrangler pages deploy .vercel/output/static --project-name=reflexx-website

echo "✅ 部署完成！"
echo "🌐 访问: https://reflexx.uk"
```

### 3. Git 工作流

```bash
# 1. 修改代码
vim src/app/page.tsx

# 2. 本地测试
npm run dev

# 3. 提交代码
git add .
git commit -m "更新功能"
git push

# 4. Cloudflare 自动部署
# 等待约 2-3 分钟
```

---

## 🎯 总结

### ✅ 优势

- ✅ **完全支持** API Routes
- ✅ **无需修改代码**
- ✅ **免费**（无限流量）
- ✅ **全球最快**（边缘网络）
- ✅ **自动部署**
- ✅ **简单易用**

### ⚠️ 限制

- ⚠️ 构建时间限制（免费版：10 分钟）
- ⚠️ 函数执行时间限制（免费版：10 秒 CPU 时间）
- ⚠️ 不支持 Node.js 特定的 API（需要使用 Edge 兼容的 API）

### 🏆 与 Vercel 对比

| 指标 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 设置难度 | ⭐ 极简 | ⭐⭐ 中等 |
| API Routes | ✅ | ✅ |
| 速度 | ⚡ 极快 | ⚡⚡ 最快 |
| 免费额度 | 100GB/月 | **无限** |
| 部署速度 | ~2 分钟 | ~3 分钟 |
| 全球节点 | ~100 | **300+** |

---

## 🚀 快速开始

```bash
# 1. 安装适配器
npm install -D @cloudflare/next-on-pages

# 2. 构建
npm run build && npx @cloudflare/next-on-pages

# 3. 部署
wrangler pages deploy .vercel/output/static --project-name=reflexx-website

# 4. 完成！
# 访问: https://reflexx.uk
```

---

**恭喜！你的网站现在运行在 Cloudflare 全球网络上，并且完全支持 API Routes！** 🎉

---

## 📚 参考资源

- **@cloudflare/next-on-pages**: https://github.com/cloudflare/next-on-pages
- **Cloudflare Pages 文档**: https://developers.cloudflare.com/pages/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

---

**需要帮助？**
- Cloudflare Community: https://community.cloudflare.com/
- Next.js GitHub: https://github.com/vercel/next.js
- Discord: https://discord.gg/cloudflaredev
