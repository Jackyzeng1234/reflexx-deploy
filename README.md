# ⚡ Reaction Time Test Platform

一个专业的反应时间和认知能力测试平台 / A professional reaction time and cognitive ability testing platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 功能特性 / Features

### ✅ 已实现 / Implemented

- **简单反应测试 (Simple Reaction Test)** - 测试视觉刺激反应速度
  - 5轮测试，自动计算平均反应时间
  - 毫秒级精确计时
  - 实时评级系统
  - 防作弊机制（检测过早点击）

- **点击速度测试 (Click Speed Test)** - 测试点击频率
  - 多种时长选择：1s, 5s, 10s, 30s, 60s, 100s
  - 实时CPS（每秒点击次数）显示
  - 历史最佳记录保存
  - 评级系统

- **多语言支持 (Multi-language Support)**
  - 🇺🇸 English
  - 🇨🇳 中文
  - 🇪🇸 Español
  - 自动检测浏览器语言
  - 语言切换持久化存储

- **统计系统 (Statistics System)**
  - 本地存储测试历史
  - 平均分和最佳分统计
  - 最近测试记录
  - 进步追踪

- **排行榜系统 (Leaderboard System)**
  - 全球排行榜
  - 今日/本周/本月/全时排行
  - 按测试类型分类
  - 匿名排行榜

- **响应式设计 (Responsive Design)**
  - 支持桌面、平板、手机
  - 深色模式支持
  - 优雅的动画效果
  - 符合WCAG无障碍标准

- **SEO优化 (SEO Optimization)**
  - 完整的元数据标签
  - Open Graph支持
  - Twitter Card支持
  - 结构化数据
  - 多语言URL支持

### 🚧 计划中 / Planned

- 选择反应测试 (Choice Reaction Test)
- 瞄准训练 (Aim Trainer)
- 用户账户系统
- 全球真实排行榜
- 成就系统
- AI训练教练
- 移动应用（React Native）
- VR/AR支持

## 🚀 快速开始 / Quick Start

### 环境要求 / Requirements

- Node.js 18.17 或更高版本
- npm, yarn, 或 pnpm

### 安装步骤 / Installation

```bash
# 克隆项目 / Clone the project
cd reaction-time-test

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start development server
npm run dev

# 打开浏览器访问 / Open in browser
# http://localhost:3000
```

### 构建生产版本 / Build for Production

```bash
# 构建项目 / Build project
npm run build

# 启动生产服务器 / Start production server
npm start
```

## 📁 项目结构 / Project Structure

```
reaction-time-test/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页 / Homepage
│   │   ├── layout.tsx         # 全局布局 / Global layout
│   │   ├── globals.css        # 全局样式 / Global styles
│   │   ├── tests/             # 测试页面 / Test pages
│   │   ├── leaderboard/       # 排行榜 / Leaderboard
│   │   └── stats/             # 统计 / Statistics
│   ├── components/            # React组件 / Components
│   │   ├── Navigation.tsx     # 导航栏 / Navigation
│   │   ├── Footer.tsx         # 页脚 / Footer
│   │   ├── SimpleReactionTest.tsx
│   │   └── ClickSpeedTest.tsx
│   ├── lib/
│   │   └── i18n/             # 国际化 / Internationalization
│   │       ├── translations.ts
│   │       └── index.ts
│   └── types/                # TypeScript类型定义
├── public/                    # 静态资源 / Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🛠️ 技术栈 / Tech Stack

- **框架**: Next.js 16.1.4 (App Router)
- **语言**: TypeScript 5.7
- **样式**: Tailwind CSS 4.0
- **状态管理**: React Hooks
- **国际化**: 自定义i18n系统
- **数据存储**: LocalStorage
- **部署**: Vercel (推荐)

## 📊 核心算法 / Core Algorithms

### 反应时间计算 / Reaction Time Calculation

```typescript
// 使用 performance.now() 获取高精度时间戳
const startTime = performance.now();
// ... 用户操作 ...
const reactionTime = performance.now() - startTime;
```

### CPS计算 / CPS Calculation

```typescript
const cps = clicks / elapsedTime;
// 实时更新
const currentCps = clicks / (selectedDuration - timeLeft);
```

## 🎨 设计原则 / Design Principles

1. **简洁直观** - 每个测试都有清晰的说明
2. **即时反馈** - 测试结果立即可见
3. **高精度** - 毫秒级计时精度
4. **国际化** - 支持多种语言
5. **响应式** - 适配所有设备

## 🔒 隐私政策 / Privacy Policy

- 所有测试数据仅存储在用户本地浏览器
- 不收集任何个人信息
- 不使用第三方跟踪工具
- LocalStorage仅用于保存测试历史

## 📈 性能优化 / Performance Optimization

- Next.js 16 Turbopack
- 自动代码分割
- 图片优化
- 字体优化
- 缓存策略

## 🤝 贡献指南 / Contributing

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证 / License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢 / Acknowledgments

- [Human Benchmark](https://humanbenchmark.com/) - 灵感来源
- [CPS Test](https://cpstest.org/) - 点击测试参考
- Next.js 团队
- Tailwind CSS 团队

## 📞 联系方式 / Contact

- 项目地址: [GitHub](https://github.com/yourusername/reaction-time-test)
- 问题反馈: [Issues](https://github.com/yourusername/reaction-time-test/issues)

---

Made with ❤️ by ReactionTest Team
