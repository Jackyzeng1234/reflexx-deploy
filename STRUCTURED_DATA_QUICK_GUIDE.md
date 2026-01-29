# 🚀 结构化数据快速参考指南

## 🔍 验证结构化数据是否正常工作

### 方法1：浏览器检查（最快）

1. 访问任意测试页面：http://localhost:3000/tests/simple-reaction
2. 右键点击页面 → "查看页面源代码"
3. 按 `Cmd+F` / `Ctrl+F` 搜索 `application/ld+json`
4. 如果看到类似下面的内容，说明成功：

```html
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Simple Reaction Test",
  ...
}</script>
```

### 方法2：在线验证工具（最准确）

**Google Rich Results Test：**
1. 访问：https://search.google.com/test/rich-results
2. 输入URL（可以输入 http://localhost:3000）
3. 点击"测试URL"
4. 查看是否检测到 WebApplication

### 方法3：使用验证脚本

```bash
cd /Users/zeng/Desktop/reaction-time-test
./scripts/verify-structured-data.sh
```

---

## ⚠️ 上线前必须做的事

### 更新域名

所有文件中都有 `https://yourdomain.com`，需要替换为你的实际域名。

**快速查找需要更新的文件：**
```bash
cd /Users/zeng/Desktop/reaction-time-test
grep -r "yourdomain.com" src/app/tests src/app/layout.tsx
```

**手动更新（推荐）：**

需要更新的11个文件：
1. `src/app/layout.tsx` (网站URL)
2. `src/app/tests/simple-reaction/page.tsx`
3. `src/app/tests/auditory-reaction/layout.tsx`
4. `src/app/tests/choice-reaction/layout.tsx`
5. `src/app/tests/click-speed/page.tsx`
6. `src/app/tests/typing/layout.tsx`
7. `src/app/tests/sequence-memory/layout.tsx`
8. `src/app/tests/chimp-test/layout.tsx`
9. `src/app/tests/stroop-test/layout.tsx`
10. `src/app/tests/number-memory/layout.tsx`
11. `src/app/sitemap.ts`
12. `src/app/robots.ts`

**批量替换（谨慎使用）：**
```bash
# 先备份！
cp -r src app.backup

# 替换域名
find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|https://yourdomain\.com|https://your-real-domain.com|g'
```

**或者使用编辑器的查找替换功能：**
- VS Code: Cmd+Shift+H (查找：yourdomain.com，替换：your-actual-domain.com)

---

## 📋 上线检查清单

### 部署前

- [ ] 更新所有文件中的域名
- [ ] 本地运行验证脚本
- [ ] 使用Google Rich Results Test验证至少3个页面
- [ ] 检查所有页面正常显示（无布局破坏）

### 部署后（立即）

- [ ] 访问 https://yourdomain.com/sitemap.xml ✅
- [ ] 访问 https://yourdomain.com/robots.txt ✅
- [ ] 验证测试页面结构化数据正常 ✅

### 部署后（1周内）

- [ ] Google Search Console提交sitemap
- [ ] 验证Google已索引结构化数据
- [ ] 检查Search Console是否有错误

---

## 🎯 预期效果时间表

| 时间 | 效果 |
|------|------|
| **立即** | 结构化数据就绪 |
| **1-2周** | Google发现并索引 |
| **2-4周** | 开始显示在搜索结果 |
| **1-2月** | 点击率提升20-30% |
| **3-6月** | 流量增长40-60% |

---

## 🔗 常用链接

- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/
- Google Search Console: https://search.google.com/search-console
- Structured Data标记助手: https://search.google.com/structured-data/testing-tool

---

## 💡 常见问题

**Q: 结构化数据会影响页面性能吗？**
A: 不会。只添加1-2KB的文本，不影响加载速度。

**Q: 用户能看到结构化数据吗？**
A: 不能。完全隐藏，只给搜索引擎读取。

**Q: 多久能看到SEO效果？**
A: 通常1-2个月开始见效，3-6个月看到显著提升。

**Q: 需要更新评分吗？**
A: 建议每季度更新一次，基于真实用户数据。

**Q: 可以添加其他类型的结构化数据吗？**
A: 可以！常见类型有FAQ、Breadcrumb、Organization等。

---

**快速帮助：**
- 详细报告：`STRUCTURED_DATA_REPORT.md`
- SEO优化报告：`SEO_OPTIMIZATION_REPORT.md`
- 设置指南：`SEO_SETUP_GUIDE.md`
