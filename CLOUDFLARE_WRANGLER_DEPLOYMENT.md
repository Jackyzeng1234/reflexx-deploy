# Cloudflare Pages 部署完整指南 - Wrangler CLI

本文档详细介绍如何使用 Wrangler CLI 将 ReflexX 网站部署到 Cloudflare Pages。

## 📋 前置准备

### 已有资源
- ✅ Gitee 仓库（代码托管）
- ✅ Cloudflare 账号（免费）
- ✅ 域名：reflexx.uk
- ✅ Supabase 数据库
- ✅ Resend API Key

### 需要安装的工具
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 验证安装
wrangler --version
```

---

## 🎯 部署方案说明

### 重要说明：静态导出模式

Cloudflare Pages 静态部署**不支持 Next.js API Routes**，这意味着：

**不受影响的功能**：
- ✅ 所有测试页面（视觉反应、听觉反应、点击速度等）
- ✅ 用户认证（登录/注册）- 通过 Supabase 直接调用
- ✅ 排行榜显示（读取数据）
- ✅ 统计页面（显示个人成绩）
- ✅ 导航和路由

**需要改动的功能**：
- ❌ Contact 表单 - 需要改用第三方服务
- ❌ 成绩提交 API - 需要直接调用 Supabase

---

## 📝 部署步骤

### 第一步：修改项目配置

#### 1.1 更新 Next.js 配置

`next.config.ts` 需要修改为静态导出模式：

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // 静态托管需要
  },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
```

#### 1.2 修改 Contact 表单

由于 API Routes 不可用，需要改用 Formspree（免费）。

**步骤**：

1. 注册 Formspree：https://formspree.io/
2. 创建新表单，获取表单 ID（类似：`mkqwykvq`）
3. 修改 `src/app/contact/page.tsx`：

```typescript
// 修改 handleSubmit 函数
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        _subject: `ReflexX Contact: ${formData.subject}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (error: any) {
    alert(error.message || 'Failed to send message. Please try again later.');
  } finally {
    setSubmitting(false);
  }
};
```

#### 1.3 修改成绩提交逻辑

`src/lib/scores.ts` 的 `submitScore` 函数需要直接调用 Supabase：

```typescript
export async function submitScore(data: ScoreData): Promise<boolean> {
  const { test_type, score, details } = data;

  try {
    // 直接使用 Supabase 客户端
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false; // 未登录，不提交到数据库
    }

    const { error } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        test_type,
        score,
        details,
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Score submission error:', error);
    return false;
  }
}
```

---

### 第二步：构建静态文件

```bash
# 进入项目目录
cd /Users/zeng/Desktop/reaction-time-test

# 设置生产环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY"
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 安装依赖
npm install

# 构建静态文件
npm run build

# 构建完成后，会在 out 目录生成静态文件
ls -la out/
```

**预期输出**：
```
out/
├── index.html
├── tests/
│   ├── index.html
│   ├── simple-reaction.html
│   └── ...
├── leaderboard.html
├── stats.html
├── _next/
│   └── static/
└── ...
```

---

### 第三步：登录 Cloudflare

```bash
# 登录 Cloudflare（会打开浏览器）
wrangler login
```

浏览器会打开 Cloudflare 授权页面，点击 "Authorize Wrangler"。

---

### 第四步：创建 Cloudflare Pages 项目

```bash
# 创建项目
wrangler pages project create reflexx-website --production-branch=main
```

**输出示例**：
```
✨ Successfully created the 'reflexx-website' project.
It will be available at https://reflexx-website.pages.dev/
```

---

### 第五步：部署到 Cloudflare Pages

```bash
# 部署 out 目录
wrangler pages deploy out --project-name=reflexx-website
```

**部署过程**：
```
✨ Successfully created the deployment 'reflexx-website-xxxxxxxx'
✨ Deployment URL: https://xxxxxxxx.reflexx-website.pages.dev

✨ Uploaded 347 files
✨ Deployed!
```

**访问临时 URL**：`https://reflexx-website.pages.dev`

---

### 第六步：配置自定义域名

#### 方案 A：域名已在 Cloudflare

如果 `reflexx.uk` 的 DNS 已在 Cloudflare：

```bash
# 添加自定义域名
wrangler pages project domain reflexx.uk --project-name=reflexx-website
```

Cloudflare 会自动配置 DNS 和 SSL。

#### 方案 B：域名在其他注册商

如果域名在其他地方（GoDaddy、Namecheap 等）：

1. 在 Cloudflare Dashboard 添加域名：
   - Workers & Pages → reflexx-website → Custom domains
   - Add domain: `reflexx.uk`

2. Cloudflare 会提供 DNS 记录：
   ```
   Type: CNAME
   Name: @
   Value: reflexx-website.pages.dev
   ```

3. 在域名注册商添加上述 DNS 记录

4. 等待 DNS 生效（5-30 分钟）

---

### 第七步：配置环境变量

**重要**：Cloudflare Pages 静态部署不支持服务端环境变量。

**解决方案**：环境变量在构建时注入。

创建 `.env.production`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://reflexx.uk
```

**构建时会自动读取**：`npm run build` 会加载 `.env.production`

---

### 第八步：设置自动部署（可选）

#### 方法 1：通过 GitHub 自动部署

**最推荐的方式**，推送代码自动部署。

1. **将 Gitee 代码推送到 GitHub**

```bash
# 创建 GitHub 仓库
# 访问 https://github.com/new

# 添加 GitHub 远程仓库
cd /Users/zeng/Desktop/reaction-time-test
git remote add github https://github.com/YOUR_USERNAME/reflexx.git

# 推送代码
git push github main
```

2. **在 Cloudflare Pages 连接 GitHub**

   - Dashboard → Workers & Pages → Create → Connect to Git
   - 选择 GitHub 仓库
   - 配置：
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
     - **Root directory**: `/`
     - **Environment variables**: 添加上述环境变量

3. **自动部署**
   - 每次推送代码到 GitHub
   - Cloudflare 自动构建并部署（约 2 分钟）

#### 方法 2：手动部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署 ReflexX..."

# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 构建
echo "🔨 构建项目..."
npm run build

# 部署
echo "☁️  部署到 Cloudflare Pages..."
wrangler pages deploy out --project-name=reflexx-website

echo "✅ 部署完成！"
echo "🌐 访问: https://reflexx.uk"
```

使用方法：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 部署后测试

### 功能测试清单

访问 https://reflexx.uk，逐项测试：

#### 1. 基础功能
- [ ] 首页正常显示
- [ ] 所有测试页面可以访问
- [ ] Navigation 导航正常工作
- [ ] 页面路由不报错

#### 2. 用户认证
- [ ] 可以注册新用户
- [ ] 可以登录已有用户
- [ ] 登录后显示用户名
- [ ] 个人资料页面正常

#### 3. 测试功能
- [ ] Simple Reaction - 可以测试
- [ ] Auditory Reaction - 可以测试
- [ ] Click Speed - 可以测试
- [ ] Typing - 可以测试
- [ ] Choice Reaction - 可以测试
- [ ] Sequence Memory - 可以测试
- [ ] Chimp Test - 可以测试
- [ ] Stroop Test - 可以测试
- [ ] Number Memory - 可以测试

#### 4. 数据功能
- [ ] 登录后测试成绩保存
- [ ] 排行榜显示 Supabase 数据
- [ ] 统计页面显示个人成绩
- [ ] 未登录成绩保存到 localStorage

#### 5. Contact 表单
- [ ] 表单可以提交
- [ ] jackyzeng1234@gmail.com 收到邮件（如果用 Formspree）
- [ ] 表单验证正常工作

---

## 🔧 常见问题和解决方案

### 问题 1：构建失败 - "Cannot find module"

**原因**：依赖未安装

**解决**：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2：页面显示空白

**原因**：静态导出路径问题

**解决**：检查 `next.config.ts` 是否配置了 `trailingSlash: true`

### 问题 3：图片不显示

**原因**：Next.js Image Optimization 在静态导出中需要特殊配置

**解决**：已配置 `images.unoptimized: true`

### 问题 4：Supabase 连接失败

**原因**：环境变量未正确加载

**解决**：
1. 确认 `.env.production` 文件存在
2. 检查环境变量值是否正确
3. 重新构建和部署

### 问题 5：DNS 解析慢

**原因**：DNS 传播需要时间

**解决**：
- 等待 5-30 分钟
- 使用 `dig reflexx.uk` 检查解析状态
- 清除浏览器 DNS 缓存

### 问题 6：Contact 表单不工作

**原因**：API Routes 不可用

**解决**：使用 Formspree 或 Getform 等第三方服务

---

## 📊 监控和维护

### Cloudflare Dashboard

访问：https://dash.cloudflare.com

#### 查看部署日志
- Workers & Pages → reflexx-website → Deployments
- 查看构建历史和状态

#### 查看分析数据
- Analytics → Pages
- 查看访问量、带宽、请求数

#### 查看函数日志
- Workers & Pages → reflexx-website → Functions
- 查看 Functions 执行日志（如果使用）

### 性能优化

#### 启用 Cloudflare 缓存
- 自动启用，无需配置
- 静态资源自动缓存

#### 配置 Cache Rules（可选）
- Dashboard → Cache → Cache Rules
- 为静态资源设置更长的缓存时间

---

## 🚀 自动部署工作流

### 推荐的 Git 工作流

```bash
# 1. 修改代码
vim src/app/page.tsx

# 2. 本地测试
npm run dev

# 3. 提交代码
git add .
git commit -m "描述你的更改"

# 4. 推送到 GitHub（自动触发部署）
git push github main

# 5. Cloudflare 自动构建并部署
# 等待约 2 分钟

# 6. 访问 https://reflexx.uk 查看更新
```

### 部署脚本（推荐）

创建 `scripts/deploy.sh`：

```bash
#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 开始部署 ReflexX...${NC}"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  有未提交的更改，先提交...${NC}"
  git add .
  git commit -m "Auto commit before deploy"
fi

# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 构建
echo -e "${YELLOW}🔨 构建项目...${NC}"
npm run build

# 部署
echo -e "${YELLOW}☁️  部署到 Cloudflare Pages...${NC}"
wrangler pages deploy out --project-name=reflexx-website

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🌐 访问: https://reflexx.uk${NC}"
```

使用：
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 📈 成本和限制

### Cloudflare Pages 免费套餐

- ✅ 无限带宽
- ✅ 无限请求
- ✅ 全球 CDN
- ✅ 自动 SSL/TLS
- ✅ 500 个构建/月
- ✅ 无限项目

### 限制

- ❌ 不支持服务端环境变量（构建时注入）
- ❌ 不支持 Next.js API Routes（静态模式）
- ❌ 构建时间限制（免费版）

### 升级到付费（可选）

如果需要：
- 更多构建次数
- 更长构建时间
- 优先支持

参考：https://www.cloudflare.com/plans

---

## 🎯 总结

### 完整部署流程

1. ✅ 修改 `next.config.ts` 为静态导出
2. ✅ 配置 Formspree 替代 Contact API
3. ✅ 修改成绩提交直接调用 Supabase
4. ✅ 设置环境变量（`.env.production`）
5. ✅ 运行 `npm run build` 生成静态文件
6. ✅ 安装并登录 `wrangler`
7. ✅ 创建 Cloudflare Pages 项目
8. ✅ 部署 `out` 目录
9. ✅ 配置自定义域名
10. ✅ 测试所有功能
11. ✅ 设置自动部署（GitHub 集成）

### 优势

- ✅ 免费（无限流量）
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 快速部署
- ✅ 简单维护

### 劣势

- ❌ 不支持 API Routes
- ❌ 需要修改 Contact 表单
- ❌ 需要第三方服务支持

### 替代方案

如果需要完整功能，推荐：
- **Vercel**（Next.js 官方，完美支持）
- **Netlify**（功能丰富）
- **Railway**（支持全栈）

---

## 🆘 需要帮助？

### 官方文档
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Next.js 部署: https://nextjs.org/docs/deployment

### 社区支持
- Cloudflare Community: https://community.cloudflare.com/
- Discord: https://discord.gg/cloudflaredev

---

**祝部署成功！🎉**

如有问题，参考以上文档或查看常见问题部分。
