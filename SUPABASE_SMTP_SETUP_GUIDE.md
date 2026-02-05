# Supabase 配置自定义 SMTP 指南

## 🎯 目标

通过配置自定义 SMTP（使用 Resend），获得更多的邮件发送数量：
- **Supabase 免费套餐**：每天 12 封邮件 ❌
- **Resend 免费套餐**：每天 3,000 封邮件 ✅

**提升 250 倍！**

---

## 📋 准备工作

### 你已经有的：

✅ Resend API Key: `re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P`
✅ Supabase 项目: `axertwlypazfplajfwjt`
✅ 域名: `reflexx.uk`

### 需要额外做的：

1. 在 Resend 验证域名
2. 在 Supabase 配置 SMTP
3. 测试邮件发送

---

## 🚀 完整配置步骤

### 第一步：在 Resend 添加并验证域名

#### 1.1 登录 Resend

1. **访问**：https://resend.com/dashboard
2. **登录账号**

#### 1.2 添加域名

1. **点击左侧菜单**：**Domains**
2. **点击按钮**：**Add Domain**
3. **输入域名**：`reflexx.uk`
4. **点击**：**Add Domain**

#### 1.3 配置 DNS 记录

Resend 会显示需要的 DNS 记录，类似：

```
类型：TXT
名称：@
值：resend-domain-verification=xxxxx

类型：TXT
名称：@
值：v=spf1 include:resend.com ~all

类型：TXT
名称：_dmarc
值：v=DMARC1; p=none
```

#### 1.4 在 Cloudflare 添加 DNS 记录

1. **登录 Cloudflare Dashboard**：https://dash.cloudflare.com
2. **选择域名**：`reflexx.uk`
3. **进入**：**DNS** → **Records**
4. **点击**：**Add record**

逐条添加上面的 DNS 记录：

**记录 1**：
```
Type: TXT
Name: @
Content: resend-domain-verification=xxxxx（从 Resend 复制）
Proxy status: DNS only（灰色云朵）
```

**记录 2**：
```
Type: TXT
Name: @
Content: v=spf1 include:resend.com ~all
Proxy status: DNS only（灰色云朵）
```

**记录 3**：
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none
Proxy status: DNS only（灰色云朵）
```

5. **点击**：**Save**

#### 1.5 等待 DNS 生效

- 通常需要 **5-30 分钟**
- Resend Dashboard 会显示验证状态
- 等待状态变为 **"Verified"**

---

### 第二步：在 Supabase 配置 SMTP

#### 2.1 登录 Supabase Dashboard

1. **访问**：https://supabase.com/dashboard
2. **选择项目**：`axertwlypazfplajfwjt`

#### 2.2 进入 SMTP 设置

1. **左侧菜单**：**Authentication** → **Settings**
2. **向下滚动**到 **"SMTP Settings"** 部分
3. **开启**：**Enable Custom SMTP**

#### 2.3 填写 SMTP 配置

**Host（SMTP 服务器）**：
```
smtp.resend.com
```

**Port（端口）**：
```
587
```
（或 465，如果使用 SSL）

**Username（用户名）**：
```
resend
```

**Password（密码）**：
```
re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P
```

**Sender email（发件人邮箱）**：
```
noreply@reflexx.uk
```

**Sender name（发件人名称）**：
```
ReflexX
```

**Encryption（加密方式）**：
```
TLS
```
（或选 SSL，如果使用 465 端口）

#### 2.4 保存配置

1. **点击**：**Save**
2. ✅ 配置完成

---

### 第三步：更新邮件模板（可选但推荐）

#### 3.1 自定义发件人信息

1. **进入**：**Authentication** → **Email Templates**
2. **选择**：**Confirm signup**
3. **修改发件人**：
   - From: `ReflexX <noreply@reflexx.uk>`

#### 3.2 测试邮件模板

**可以自定义邮件内容**：

```html
<h2>欢迎来到 ReflexX！</h2>

<p>感谢你注册 ReflexX 反应时间测试平台。</p>

<p>请点击下面的链接验证你的邮箱：</p>

<p><a href="{{ .ConfirmationURL }}">验证邮箱</a></p>

<p>如果你没有注册 ReflexX 账号，可以忽略这封邮件。</p>

<p>– ReflexX 团队</p>
```

---

### 第四步：测试邮件发送

#### 4.1 注册一个测试账号

1. **访问**：https://reflexx.uk/auth
2. **注册新账号**（使用真实邮箱）
3. **提交注册**

#### 4.2 检查邮件

1. **打开邮箱**
2. **检查收件箱**（包括垃圾邮件文件夹）
3. **应该看到验证邮件**
4. **查看发件人**：应该是 `ReflexX <noreply@reflexx.uk>`

#### 4.3 验证邮件头（可选）

**查看邮件源代码**，确认是通过 Resend 发送的：

```
Received: from resend.com
...
X-Resend-Id: xxxxxxxx
```

---

## 📊 配置对比

### 配置前（Supabase 默认）

```
邮件服务商：Supabase
限制：每天 12 封
速度：较慢
发件人：noreply@mail.supabase.io
```

### 配置后（Resend SMTP）

```
邮件服务商：Resend
限制：每天 3,000 封 ✅
速度：更快 ✅
发件人：noreply@reflexx.uk ✅
送达率：更高 ✅
```

---

## ✅ 验证配置成功

### 检查清单

- [ ] Resend 域名已验证（状态：Verified）
- [ ] Cloudflare DNS 记录已添加
- [ ] Supabase SMTP 已启用
- [ ] SMTP 配置已保存
- [ ] 测试邮件发送成功
- [ ] 邮件来自 `noreply@reflexx.uk`

---

## 🔧 故障排查

### 问题 1：DNS 验证失败

**症状**：Resend 显示 "Pending" 或 "Failed"

**解决**：
1. 检查 Cloudflare DNS 记录是否正确
2. 确保 Proxy status 是 **DNS only**（灰色云朵）
3. 等待 5-30 分钟让 DNS 生效
4. 使用在线工具检查 DNS：https://dnschecker.org

---

### 问题 2：邮件发送失败

**症状**：Supabase 显示 SMTP 错误

**检查**：
1. Resend API Key 是否正确
2. SMTP 服务器地址：`smtp.resend.com`
3. 端口：`587` (TLS) 或 `465` (SSL)
4. 用户名：`resend`
5. 密码：你的 Resend API Key

---

### 问题 3：邮件被标记为垃圾邮件

**原因**：域名未验证或 SPF/DKIM 未配置

**解决**：
1. 确保 Resend 域名已验证
2. 添加 SPF 记录：`v=spf1 include:resend.com ~all`
3. 添加 DMARC 记录：`v=DMARC1; p=none`
4. Resend 会自动配置 DKIM

---

### 问题 4：端口 587 不工作

**尝试使用端口 465**：

```
Host: smtp.resend.com
Port: 465
Encryption: SSL
```

---

## 📈 监控邮件发送

### Resend Dashboard

1. **访问**：https://resend.com/dashboard
2. **查看**：
   - 发送统计
   - 退信率
   - 点击率
   - 送达率

### Supabase Logs

1. **Supabase Dashboard**
2. **Authentication** → **Reports**
3. **查看**：
   - 邮件发送记录
   - 失败原因
   - 速率限制

---

## 🎯 优化建议

### 1. 邮件模板优化

**添加品牌元素**：
- Logo
- 品牌颜色
- 友好的文案

### 2. 监控退信率

**保持退信率低于 5%**：
- 定期清理无效邮箱
- 处理退回邮件
- 避免频繁发送

### 3. 使用专业发件人

**避免**：
- `noreply@` （可能被拦截）
- `no-reply@` （不专业）

**推荐**：
- `hello@reflexx.uk`
- `team@reflexx.uk`
- `support@reflexx.uk`

---

## 💰 成本对比

### Supabase 邮件服务

```
免费套餐：12 封/天
Pro 套餐：50,000 封/天 ($25/月)
```

### Resend 邮件服务

```
免费套餐：3,000 封/天 ($0)
Pro 套餐：100,000 封/天 ($20/月)
```

**结论**：使用 Resend SMTP 更划算！

---

## 🎉 总结

### 配置完成后

✅ **邮件限制提升**：从 12 封/天 → 3,000 封/天
✅ **送达率提升**：专业的邮件服务
✅ **自定义发件人**：使用你的域名
✅ **更好的统计**：详细的邮件分析

### 下一步

1. ✅ 配置 Resend 域名
2. ✅ 配置 Supabase SMTP
3. ✅ 测试邮件发送
4. ✅ 享受更多的邮件发送额度！

---

## 📞 需要帮助？

- **Resend 文档**：https://resend.com/docs
- **Supabase SMTP 文档**：https://supabase.com/docs/guides/auth/social-login/auth-smtp
- **Resend 支持**：support@resend.com

---

**配置时间：约 15-20 分钟**
**难度：⭐⭐⭐**（中等）
**推荐度：⭐⭐⭐⭐⭐**（强烈推荐）
