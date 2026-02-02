# ReflexX 部署指南

本文档介绍如何将 ReflexX 网站部署到 Vercel 并配置 reflexx.uk 域名。

## 前置准备

- ✅ 已有域名：reflexx.uk
- ✅ GitHub 账号（用于代码托管）
- ✅ Vercel 账号（可使用 GitHub 登录）

## 部署步骤

### 第一步：推送到 GitHub

1. 在 GitHub 创建新仓库（例如：reflexx-website）

2. 在项目目录执行：
```bash
cd /Users/zeng/Desktop/reaction-time-test

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到 Vercel"

# 关联远程仓库
git remote add origin https://github.com/YOUR_USERNAME/reflexx-website.git

# 推送代码
git branch -M main
git push -u origin main
```

### 第二步：部署到 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up" 或 "Login"，使用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择刚才创建的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (默认)
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: `.next` (默认)

6. 配置环境变量（Environment Variables）：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=https://reflexx.uk
   RESEND_API_KEY=your-resend-api-key
   CONTACT_EMAIL=jackyzeng1234@gmail.com
   ```

7. 点击 "Deploy"
8. 等待部署完成（约 2-3 分钟）
9. 部署成功后会得到一个 Vercel 域名（例如：https://reflexx-website.vercel.app）

### 第三步：配置自定义域名

1. 在 Vercel 项目中，进入 **Settings** → **Domains**
2. 点击 "Add Domain"，输入：`reflexx.uk`
3. Vercel 会显示 DNS 配置信息

### 第四步：配置 DNS

在你的域名注册商（购买 reflexx.uk 的地方）配置 DNS：

#### 方案 A：使用 A 记录（推荐）
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600 (或默认)
```

#### 方案 B：使用 CNAME（如果可用）
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600 (或默认)
```

同时添加 www 子域名（可选）：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 第五步：验证域名

1. 保存 DNS 配置后，等待生效（通常 5-30 分钟）
2. 在 Vercel 控制台点击 "Verify" 按钮
3. 验证成功后，访问 https://reflexx.uk

## Resend 邮件域名配置（重要）

在测试阶段，Contact 表单使用 Resend 的测试域名 `onboarding@resend.dev`。要使用自定义域名发送邮件：

1. 访问 https://resend.com/domains
2. 点击 "Add Domain"
3. 输入域名：`reflexx.uk`
4. 按照提示配置 DNS 记录：
   ```
   Type: TXT
   Name: _resend
   Value: <resend提供的验证值>
   ```

5. 验证通过后，修改 `/src/app/api/contact/route.ts`：
   ```typescript
   from: 'ReflexX Contact <noreply@reflexx.uk>',  // 改为你的域名
   ```

6. 重新部署

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 网站域名 | ✅ |
| `RESEND_API_KEY` | Resend API 密钥 | ✅ |
| `CONTACT_EMAIL` | 联系邮箱接收地址 | ✅ |

## 自动部署

配置完成后，每次推送代码到 GitHub 主分支，Vercel 会自动重新部署。

```bash
# 修改代码后
git add .
git commit -m "描述你的更改"
git push

# Vercel 会自动部署
```

## 监控和日志

- 访问 Vercel 控制台查看部署日志
- 查看函数执行情况（包括 Contact API）
- 监控网站性能和错误

## 故障排查

### 域名无法访问
- 检查 DNS 配置是否正确
- 使用 `dig reflexx.uk` 查看解析结果
- 等待 DNS 生效（最多 48 小时）

### Contact 表单不工作
- 检查 Vercel 的函数日志
- 确认环境变量已正确配置
- 查看 Resend 控制台的邮件发送记录

### Supabase 连接失败
- 确认环境变量已添加
- 检查 Supabase 项目设置
- 查看 Vercel 部署日志

## 成功标志

部署成功后：
- ✅ 访问 https://reflexx.uk 显示网站
- ✅ 所有测试功能正常
- ✅ Contact 表单可以发送邮件
- ✅ 登录和注册功能正常
- ✅ 排行榜显示数据

## 下一步优化

- 配置 CDN 加速（Vercel 自动处理）
- 设置 SSL 证书（Vercel 自动提供）
- 配置缓存策略
- 添加网站分析（Google Analytics 等）
- 优化 SEO（sitemap, robots.txt）

---

如有问题，参考：
- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment
