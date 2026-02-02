# ReflexX 上线完整清单

## 📋 部署前配置（必须完成）

### 1. 选择部署平台并配置 ⭐ 重要

**推荐：Vercel（Next.js 官方平台）**

为什么选择 Vercel：
- ✅ Next.js 官方平台，完美支持
- ✅ 无需修改任何代码
- ✅ 支持所有功能（API Routes、SSR、图片优化）
- ✅ 免费（个人项目）
- ✅ 自动 HTTPS 和全球 CDN
- ✅ 自动部署（推送代码即部署）

#### Vercel 部署步骤

**方式 A：通过 Vercel 网页（最简单）**

1. 推送代码到 GitHub
   ```bash
   cd /Users/zeng/Desktop/reaction-time-test

   # 如果还没有 git 仓库
   git init
   git add .
   git commit -m "准备部署到 Vercel"

   # 推送到 GitHub
   git remote add origin https://github.com/YOUR_USERNAME/reflexx.git
   git push -u origin main
   ```

2. 部署到 Vercel
   - 访问：https://vercel.com/new
   - 导入 GitHub 仓库
   - Framework: Next.js（自动检测）
   - 点击 "Deploy"

3. 配置环境变量
   - 进入项目 → Settings → Environment Variables
   - 添加以下变量（Production 环境）：
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY
     NEXT_PUBLIC_SITE_URL=https://reflexx.uk
     RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
     CONTACT_EMAIL=jackyzeng1234@gmail.com
     ```

4. 配置自定义域名
   - Settings → Domains → Add Domain
   - 输入：`reflexx.uk`
   - Vercel 会提供 DNS 配置

---

### 2. 域名 DNS 配置 ⚠️ 必须完成

在你的域名注册商（购买 reflexx.uk 的地方）配置 DNS：

```dns
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600（或默认）
```

如果需要 www：
```dns
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**等待 DNS 生效**：通常 5-30 分钟，最长 48 小时

---

### 3. Resend 邮件域名验证（可选但推荐）

**当前状态**：使用 Resend 测试域名 `onboarding@resend.dev`
**限制**：只能发送到 `jackyzeng1234@gmail.com`（Resend 账号邮箱）

**升级到生产域名**：

1. 访问：https://resend.com/domains
2. 点击 "Add Domain"
3. 输入：`reflexx.uk`
4. 添加 DNS 记录（Resend 会提供）：
   ```dns
   Type: TXT
   Name: _resend
   Value: <resend提供的验证值>
   ```

5. 验证通过后，修改代码：
   - 文件：`src/app/api/contact/route.ts`
   - 第 48 行，改为：
     ```typescript
     from: 'ReflexX Contact <noreply@reflexx.uk>',
     ```

6. 重新部署

---

## ✅ 当前已完成的配置

### 代码配置
- [x] 域名已更新为 reflexx.uk
- [x] SEO 元数据已更新
- [x] 结构化数据已更新
- [x] Sitemap 和 robots.txt 已配置
- [x] 品牌名称和 Logo 已统一（ReflexX）
- [x] Contact 表单已实现（Resend 集成）
- [x] TypeScript 类型错误已修复
- [x] Next.js 配置已优化

### 文件清单
- [x] `.env.production` - 生产环境变量模板
- [x] `next.config.ts` - Next.js 配置（已恢复完整功能）
- [x] `vercel.json` - Vercel 配置文件
- [x] `.gitignore` - Git 忽略文件
- [x] `package.json` - 依赖和脚本
- [x] `DEPLOYMENT.md` - 部署文档
- [x] `PRODUCTION_CHECKLIST.md` - 上线检查清单
- [x] `CLOUDFLARE_DEPLOYMENT.md` - Cloudflare 部署指南

---

## 🚀 上线后必须配置

### 1. DNS 验证（上线后立即）

部署后：
1. 在 Vercel Dashboard 查看 Domains 部分
2. 确认域名状态为 "Valid Configuration"
3. 如果有问题，检查 DNS 配置

### 2. 功能测试（上线后立即）

访问 https://reflexx.uk，测试以下功能：

#### 基础功能
- [ ] 首页正常显示
- [ ] 所有测试页面可以访问
- [ ] Navigation 导航正常
- [ ] 页面链接不跳转错误

#### 用户认证
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以登出
- [ ] 个人资料页面正常

#### 测试功能
- [ ] Simple Reaction - 测试并保存成绩
- [ ] Auditory Reaction - 测试并保存成绩
- [ ] Click Speed - 测试并保存成绩
- [ ] Typing - 测试并保存成绩
- [ ] Choice Reaction - 测试并保存成绩
- [ ] Sequence Memory - 测试并保存成绩
- [ ] Chimp Test - 测试并保存成绩
- [ ] Stroop Test - 测试并保存成绩
- [ ] Number Memory - 测试并保存成绩

#### 数据保存
- [ ] 登录用户成绩保存到 Supabase
- [ ] 排行榜显示真实数据
- [ ] 统计页面显示个人成绩
- [ ] 未登录用户成绩保存到 localStorage

#### Contact 表单
- [ ] 表单可以提交
- [ ] jackyzeng1234@gmail.com 收到邮件
- [ ] 邮件内容完整（姓名、邮箱、主题、消息）

### 3. 环境变量验证（上线后立即）

在 Vercel Dashboard → Settings → Environment Variables 确认：
- [ ] 所有变量已添加
- [ ] 选择了正确的环境（Production）
- [ ] `NEXT_PUBLIC_SITE_URL=https://reflexx.uk`

### 4. 搜索引擎提交（上线后 24 小时内）

#### Google Search Console
1. 访问：https://search.google.com/search-console
2. 添加资源：https://reflexx.uk
3. 验证域名所有权（HTML 文件上传或 DNS 验证）
4. 提交 Sitemap：https://reflexx.uk/sitemap.xml
5. 请求编入索引

#### Bing Webmaster Tools
1. 访问：https://www.bing.com/webmasters
2. 添加网站
3. 验证域名
4. 提交 Sitemap

---

## 📊 上线后优化配置（可选但推荐）

### 1. 性能监控

**Vercel Analytics**（自动启用）
- 查看页面加载速度
- 监控 Core Web Vitals

**Google Analytics**（可选）
1. 注册：https://analytics.google.com
2. 创建媒体资源
3. 获取跟踪代码
4. 在 `src/app/layout.tsx` 添加

### 2. 错误监控

**Sentry**（可选）
- 捕获生产环境错误
- 追踪用户问题

### 3. 安全配置

在 Vercel Dashboard → Settings：
- [ ] 启用 HTTPS only（默认启用）
- [ ] 配置 CSP Headers（Content Security Policy）

### 4. 缓存配置

Vercel 自动配置缓存，但可以自定义：
- 图片缓存时间
- 静态资源缓存

### 5. 备份配置

**Supabase 数据备份**
1. 登录 Supabase Dashboard
2. Database → Backups
3. 启用自动备份（付费功能，或手动导出）

---

## 🔍 故障排查清单

### 网站无法访问
- [ ] 检查 DNS 配置
- [ ] 使用 `dig reflexx.uk` 查看解析
- [ ] 等待 DNS 生效（最多 48 小时）
- [ ] 检查 Vercel 部署状态

### API 请求失败
- [ ] 确认环境变量已配置
- [ ] 检查 Vercel 函数日志
- [ ] 验证 Supabase 连接

### Contact 表单不工作
- [ ] 检查 Vercel 函数日志
- [ ] 确认 Resend API Key 正确
- [ ] 查看 Resend Dashboard 日志

### 成绩未保存
- [ ] 检查 Supabase RLS 策略
- [ ] 查看浏览器控制台错误
- [ ] 检查网络请求

---

## 📈 SEO 优化（上线后 1 周内）

### 1. Meta 标签优化
- [ ] 每个测试页面有独特的描述
- [ ] 添加 Open Graph 图片
- [ ] 添加 Twitter Card

### 2. 内容优化
- [ ] 添加 FAQ 部分
- [ ] 编写测试指南文章
- [ ] 添加用户评价/推荐

### 3. 外部链接
- [ ] 提交到相关目录
- [ ] 社交媒体推广
- [ ] 友情链接

---

## 🆘 紧急联系和资源

### 支持文档
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Resend: https://resend.com/docs

### 社区
- Vercel Discord: https://vercel.com/discord
- Next.js GitHub: https://github.com/vercel/next.js
- Supabase GitHub: https://github.com/supabase/supabase

---

## ✅ 上线成功标志

当你看到以下所有项，说明上线成功：

1. ✅ 访问 https://reflexx.uk 显示网站
2. ✅ DNS 解析正确（无证书错误）
3. ✅ 所有测试功能正常
4. ✅ 用户可以登录和注册
5. ✅ 排行榜有真实数据
6. ✅ Contact 表单发送邮件成功
7. ✅ Lighthouse 性能评分 > 90
8. ✅ 移动端显示正常
9. ✅ 已提交到 Google Search Console

---

## 🎉 上线完成后

### 立即做
1. 通知用户/朋友测试
2. 在社交媒体发布
3. 监控错误日志（前 3 天）

### 第一周
1. 收集用户反馈
2. 修复发现的 bug
3. 优化性能

### 第一个月
1. 分析流量数据
2. 优化 SEO
3. 规划新功能

---

**祝上线成功！🚀**

如有问题，参考以上文档或联系支持。
