# Google Analytics 接入指南

## 🎯 目标

在 ReflexX 网站中接入 Google Analytics 4，统计用户行为和网站数据。

---

## 📋 准备工作

### 你需要的：

- ✅ Google 账号（Gmail 即可）
- ✅ 网站域名：`https://reflexx.uk`
- ✅ 项目路径：`/Users/zeng/Desktop/reaction-time-test`

---

## 🚀 完整步骤

### 第一步：创建 Google Analytics 账号

#### 1.1 访问 Google Analytics

1. **打开**：https://analytics.google.com
2. **点击**："开始测量"
3. **登录** Google 账号

---

#### 1.2 创建账号

**填写账号信息**：

```
账号名称：ReflexX Production
或：ReflexX Website

账号数据共享位置：任意选择
（不影响使用，选择一个即可）
```

**点击**："下一步"

---

#### 1.3 创建媒体资源

**填写媒体资源信息**：

```
媒体资源名称：ReflexX
网站网址：https://reflexx.uk
行业类别：科技 > 互联网与电信
报告时区：中国 - 北京时间 (GMT+08:00)
或：你所在的时区
```

**点击**："创建"

---

#### 1.4 接受服务条款

**阅读并勾选**：
- ✅ 我接受《Google Analytics（分析）服务条款》
- ✅ 我接受《数据处理修正条款》

**点击**："接受"

---

#### 1.5 选择平台

**选择**："网站"

**点击**："设置数据流"

---

#### 1.6 设置数据流

**填写信息**：

```
数据流名称：ReflexX Website
网站网址：https://reflexx.uk
增强型衡量功能：开启 ✅
```

**点击**："创建数据流"

---

#### 1.7 获取跟踪 ID

**创建成功后，你会看到**：

```
测量 ID：G-XXXXXXXXXX
```

**重要**：复制这个 ID，后面会用到！

---

### 第二步：在项目中集成 Google Analytics

#### 2.1 安装依赖（可选，但推荐）

虽然 Next.js 有内置的 `next/script` 组件，但我们需要安装 Google Analytics 类型定义：

```bash
npm install @types/gtag-cli --save-dev
```

**或者不安装也行**，直接使用字符串即可。

---

#### 2.2 配置环境变量

**创建或更新**：`.env.local` 和 `.env.production`

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**将 `G-XXXXXXXXXX` 替换为你的实际 ID。**

---

#### 2.3 在 Next.js 中添加 Google Analytics

**方法**：使用 Next.js 的 `next/script` 组件

**创建文件**：`src/components/GoogleAnalytics.tsx`

```typescript
'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
```

---

#### 2.4 在 Layout 中使用

**编辑**：`src/app/layout.tsx`

```typescript
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 其他 head 内容 */}
      </head>
      <body>
        <GoogleAnalytics /> {/* 添加这一行 */}
        <AuthProvider>
          <I18nProvider>
            <StructuredData />
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 第三步：测试 Google Analytics

#### 3.1 本地测试

**启动开发服务器**：

```bash
npm run dev
```

**打开浏览器开发者工具**：

1. 访问：http://localhost:3000
2. 按 `F12` 打开开发者工具
3. 进入 **Network** 标签
4. 刷新页面
5. 搜索：`gtag` 或 `analytics`

**应该看到**：
```
请求：https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX
状态：200 OK
```

---

#### 3.2 检查 Google Analytics 实时报告

**操作**：

1. 访问：https://analytics.google.com
2. 选择你的账号
3. 左侧菜单：**报告** → **实时** → **概览**
4. **访问你的网站**：https://reflexx.uk
5. **等待 1-2 分钟**

**应该看到**：
- **实时用户**：显示 1 个活跃用户
- **屏幕分辨率**：显示你的屏幕尺寸
- **位置**：显示你的大概位置

---

## 🎨 事件跟踪（可选）

如果你想跟踪特定事件（如测试完成、按钮点击），可以添加自定义事件：

### 示例：跟踪测试开始

**创建文件**：`src/lib/analytics.ts`

```typescript
// Google Analytics 事件跟踪
export const trackEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// 预定义事件
export const analyticsEvents = {
  // 测试相关
  testStart: (testName: string) => trackEvent('test_start', {
    test_name: testName,
  }),

  testComplete: (testName: string, score: number) => trackEvent('test_complete', {
    test_name: testName,
    score: score,
  }),

  // 用户交互
  signUp: () => trackEvent('sign_up', {}),
  login: () => trackEvent('login', {}),

  // 页面浏览
  pageView: (page: string) => trackEvent('page_view', {
    page_title: page,
  }),
};
```

**使用示例**：

```typescript
import { analyticsEvents } from '@/lib/analytics';

// 在测试开始时
analyticsEvents.testStart('Simple Reaction Test');

// 在测试完成时
analyticsEvents.testComplete('Simple Reaction Test', 250);
```

---

## 📊 可以跟踪的数据

### 自动收集的数据

Google Analytics 会自动收集：

- ✅ **页面浏览**：用户访问哪些页面
- ✅ **用户地理位置**：国家、城市
- ✅ **设备和浏览器**：PC/手机、浏览器类型
- ✅ **屏幕分辨率**：1920x1080 等
- ✅ **语言设置**：用户使用的语言
- ✅ **流量来源**：用户从哪里来（搜索引擎、直接访问等）
- ✅ **用户行为**：停留时间、跳出率等

---

### 自定义事件（可选）

如果你想跟踪更多细节，可以添加：

```typescript
// 用户完成测试
trackEvent('test_completed', {
  test_type: 'simple_reaction',
  score: 250,
  test_duration: 5000,
});

// 用户注册
trackEvent('sign_up', {
  method: 'email',
});

// 用户登录
trackEvent('login', {
  method: 'email',
});

// 点击特定按钮
trackEvent('cta_clicked', {
  button_name: 'start_test',
  location: 'homepage',
});
```

---

## 🔍 验证安装

### 方法 1：使用 Google Analytics 助手

1. **安装 Chrome 扩展**：
   - 访问：https://chrome.google.com/webstore
   - 搜索：Google Analytics Debugger
   - 添加到 Chrome

2. **打开你的网站**：https://reflexx.uk

3. **点击扩展图标**，检查状态：
   ```
   状态：Measurement ID: G-XXXXXXXXXX ✓
   ```

4. **如果显示绿色对勾** → 安装成功！

---

### 方法 2：查看实时报告

1. **访问**：https://analytics.google.com
2. **左侧菜单**：**报告** → **实时**
3. **访问你的网站**：https://reflexx.uk
4. **等待 1-2 分钟**
5. **查看**：实时用户数应该增加

---

## 📈 查看数据

### 热门报告

#### 1. 实时报告

**路径**：**报告** → **实时**

**查看**：
- 当前在线用户
- 最热门的页面
- 用户地理位置
- 转化事件

---

#### 2. 用户获取

**路径**：**报告** → **生命周期** → **用户获取**

**查看**：
- 新用户数量
- 用户增长趋势
- 获客渠道

---

#### 3. 受众群体

**路径**：**报告** → **受众群体**

**查看**：
- 用户年龄分布
- 用户兴趣
- 地理位置
- 使用的设备

---

#### 4. 行为报告

**路径**：**报告** → **生命周期** → **参与度**

**查看**：
- 页面浏览量
- 会话时长
- 跳出率
- 事件追踪

---

## 🎯 最佳实践

### 1. 不要在生产环境使用测试 ID

**测试 ID**（开发环境）：
```
环境变量：NEXT_PUBLIC_GA_MEASUREMENT_ID
开发环境：使用测试 ID
生产环境：使用真实 ID
```

### 2. 遵守隐私政策

**注意**：
- ✅ 在隐私政策中说明使用 Google Analytics
- ✅ 不要收集个人身份信息（PII）
- ✅ 允许用户选择退出

---

### 3. 设置数据保留

**配置**：

1. **Google Analytics** → **管理** → **数据设置**
2. **数据保留**：选择保留时间（建议 2 个月或 14 个月）
3. **重置报告**：设置为 2 个月（节省配额）

---

## 🚨 常见问题

### 问题 1：实时报告没有数据

**原因**：延迟或配置错误

**解决**：
- 等待 5-10 分钟
- 检查浏览器控制台是否有错误
- 确认 GA_MEASUREMENT_ID 正确

---

### 问题 2：数据不准确

**原因**：广告拦截器

**解决**：
- 在隐私政策中说明
- 提供 opt-out 选项
- 在统计时考虑拦截率

---

### 问题 3：开发环境不工作

**原因**：环境变量未加载

**解决**：
- 确保 `.env.local` 中有配置
- 重启开发服务器

---

## 📋 配置检查清单

部署到生产环境前，确保：

- [ ] 已创建 Google Analytics 账号
- [ ] 已获取测量 ID（G-XXXXXXXXXX）
- [ ] 已安装依赖（可选）
- [ ] 已添加 GoogleAnalytics 组件
- [ ] 已在 layout.tsx 中使用组件
- [ ] 已配置环境变量
- [ ] 本地测试通过
- [ ] 生产环境变量已配置
- [ ] 验证安装成功

---

## 🎉 总结

### 集成完成后

**你可以**：
- ✅ 查看实时用户数
- ✅ 了解用户地理位置
- ✅ 分析用户行为
- ✅ 优化网站性能
- ✅ 做数据驱动的决策

**下一步**：
- 提交代码到 GitHub
- 在隐私政策中说明使用 GA
- 考虑添加事件跟踪

---

## 📞 需要帮助？

- **Google Analytics 文档**：https://support.google.com/analytics
- **Next.js 集成指南**：https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries/google-analytics

---

**开始接入吧！** 🚀
