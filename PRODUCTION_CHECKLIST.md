# ReflexX 上线前检查清单

部署前请逐项检查以下配置，确保生产环境正常运行。

## ✅ 已完成的配置

### 1. 环境变量配置 ✅

文件：`.env.production`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://reflexx.uk
RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
CONTACT_EMAIL=jackyzeng1234@gmail.com
```

### 2. 域名配置 ✅

- [x] 主域名：reflexx.uk
- [x] SEO 元数据已更新（src/app/layout.tsx）
- [x] 结构化数据已更新（URL: https://reflexx.uk）
- [x] Sitemap 使用环境变量（自动适配）
- [x] Robots.txt 使用环境变量（自动适配）

### 3. 品牌配置 ✅

- [x] Logo: REFLEFX (橙红色渐变 ⚡)
- [x] Slogan: "Test Your Limits"
- [x] Navigation 组件已更新
- [x] Footer 组件已更新
- [x] 首页 Hero 已更新

### 4. 类型安全 ✅

- [x] 修复了 leaderboard/page.tsx 的类型错误
- [x] 所有 TypeScript 类型检查通过

---

## ⚠️ 需要在 Cloudflare Pages 配置的项目

### 1. 环境变量（重要）

在 Cloudflare Pages Dashboard 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://axertwlypazfplajfwjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY
NEXT_PUBLIC_SITE_URL=https://reflexx.uk
RESEND_API_KEY=re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
CONTACT_EMAIL=jackyzeng1234@gmail.com
```

**环境**: Production (所有环境)

### 2. 构建设置

```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (留空)
Node.js version: 18或20 (推荐最新)
```

### 3. 域名 DNS 配置

**如果域名在 Cloudflare**:
- 添加 CNAME 记录指向 Pages 项目
- Cloudflare 会自动配置

**如果域名在其他注册商**:
```
Type: CNAME
Name: @
Value: reflexx-website.pages.dev
TTL: 3600
```

---

## 🔍 关键功能测试清单

部署后请逐项测试：

### 基础功能
- [ ] 首页正常加载
- [ ] 所有测试页面可以访问
- [ ] Tests 页面正常显示
- [ ] Navigation 导航正常工作
- [ ] Footer 链接正确

### 用户认证
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] 登出功能正常
- [ ] 个人资料页面可以访问

### 测试功能
- [ ] Simple Reaction Test 可以测试
- [ ] Auditory Reaction Test 可以测试
- [ ] Click Speed Test 可以测试
- [ ] Typing Test 可以测试
- [ ] Choice Reaction Test 可以测试
- [ ] Sequence Memory Test 可以测试
- [ ] Chimp Test 可以测试
- [ ] Stroop Test 可以测试
- [ ] Number Memory Test 可以测试

### 数据保存
- [ ] 登录用户成绩保存到 Supabase
- [ ] 未登录用户成绩保存到 localStorage
- [ ] 排行榜显示数据
- [ ] 统计页面显示个人成绩

### Contact 表单
- [ ] 表单可以提交
- [ ] 邮件成功发送到 jackyzeng1234@gmail.com
- [ ] 表单验证正常工作

### SEO 和性能
- [ ] 访问 https://reflexx.uk/sitemap.xml
- [ ] 访问 https://reflexx.uk/robots.txt
- [ ] 检查页面 title 和 meta description
- [ ] 使用 Lighthouse 测试性能

---

## 🚨 已知限制和注意事项

### 1. Contact 表单

**当前状态**: 使用 Resend 测试域名
- 发件人: `onboarding@resend.dev`
- 接收人: `jackyzeng1234@gmail.com` (必须是 Resend 账号邮箱)

**限制**: 测试模式只能发送到注册账号邮箱

**如何升级到生产模式**:
1. 在 Resend 验证域名: reflexx.uk
2. 修改 `src/app/api/contact/route.ts` 第 48 行:
   ```typescript
   from: 'ReflexX Contact <noreply@reflexx.uk>',
   ```
3. 重新部署

参考: https://resend.com/domains

### 2. Cloudflare Pages 限制

Next.js 在 Cloudflare Pages 部署注意事项：

- ✅ 支持静态页面生成
- ✅ 支持客户端渲染
- ⚠️ API Routes 需要使用 Cloudflare Pages Functions
- ⚠️ 某些 Node.js 特性不可用（Edge Runtime 限制）

**当前 API Routes**:
- `/api/contact` - 可能需要改用 Cloudflare Functions
- `/api/scores` - GET 请求正常，POST 需要验证
- `/api/auth/logout` - 需要测试

**如果 API Routes 有问题**:
1. 使用 Cloudflare Pages Functions 重写
2. 或将 Supabase 直接暴露（使用 RLS 保护）

### 3. 图片优化

Next.js Image Optimization 在静态部署中有限制：
- 已在配置中添加 `unoptimized: true`
- 图片会直接提供，不经过优化

---

## 📊 部署后监控

### 1. Cloudflare Dashboard

- 查看 Workers & Pages 日志
- 监控错误率
- 检查访问统计

### 2. Supabase Dashboard

- 监控数据库连接
- 查看用户注册情况
- 检查成绩提交记录

### 3. Resend Dashboard

- 查看邮件发送记录
- 监控发送成功率

---

## 🔐 安全检查

- [ ] API 密钥已添加到环境变量（未硬编码）
- [ ] Supabase Row Level Security (RLS) 已启用
- [ ] 没有 console.log 暴露敏感信息
- [ ] .env 文件在 .gitignore 中
- [ ] 没有 API 密钥提交到 Git

---

## 📈 SEO 优化建议

部署后建议：

1. **提交到搜索引擎**
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters

2. **提交 Sitemap**
   - Google: https://reflexx.uk/sitemap.xml
   - Bing: 同上

3. **添加 Google Analytics** (可选)
   - 在 layout.tsx 添加 GA 跟踪代码

4. **创建社交媒体账号** (可选)
   - Twitter/X
   - Facebook
   - LinkedIn

---

## 🆘 常见问题

### Q: API Routes 返回 404
**A**: Cloudflare Pages 静态部署不支持 Next.js API Routes，需要使用 Cloudflare Pages Functions

### Q: 环境变量未生效
**A**:
1. 确认在 Cloudflare Dashboard 添加了环境变量
2. 确认选择了正确的环境（Production）
3. 重新部署项目

### Q: 域名无法访问
**A**:
1. 检查 DNS 配置
2. 等待 DNS 生效（最多 48 小时）
3. 使用 `dig reflexx.uk` 检查解析

### Q: Contact 表单不工作
**A**:
1. 检查 Cloudflare Functions 日志
2. 确认 Resend API Key 正确
3. 查看 Resend Dashboard 的错误日志

---

## ✅ 部署成功标志

当你看到以下情况，说明部署成功：

1. ✅ 访问 https://reflexx.uk 显示网站
2. ✅ 所有测试功能正常
3. ✅ 用户可以登录和注册
4. ✅ 排行榜显示数据
5. ✅ Contact 表单发送邮件
6. ✅ 页面加载速度快（< 3 秒）

---

## 📝 最后的提醒

1. **备份重要数据**: 定期备份 Supabase 数据库
2. **监控错误**: 设置 Cloudflare 错误告警
3. **定期更新**: 保持依赖包更新
4. **用户反馈**: 关注 Contact 表单的反馈

---

**祝部署成功！🎉**

如有问题，参考：
- Cloudflare Pages 文档: https://developers.cloudflare.com/pages/
- Next.js 部署文档: https://nextjs.org/docs/deployment
- Supabase 文档: https://supabase.com/docs
