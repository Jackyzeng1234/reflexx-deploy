# Supabase 性能优化报告

## 📊 性能测试结果

**测试日期**: 2026-01-26
**平均响应时间**: 856ms
**测试次数**: 8次

### 详细结果

| 查询类型 | 耗时 | 评级 | 说明 |
|---------|------|------|------|
| Profiles 查询 | **1484ms** | ❌ 很慢 | 首次连接冷启动 |
| Scores 查询 | 400-462ms | ✓ 可接受 | 正常范围 |
| JOIN 查询 | 400ms | ✓ 可接受 | 包含 profile 连接 |
| 排行榜查询 | 418ms | ✓ 可接受 | 实际使用的查询 |
| 批量查询 (10个) | 2900ms | ✓ 可接受 | 平均 290ms/个 |

### 🐛 主要问题

1. **Profiles 查询异常慢 (1.5秒)**
   - 可能原因：冷启动、缺少索引、网络延迟
   - 影响：用户登录后页面加载缓慢

2. **整体响应时间偏长 (400-500ms)**
   - 可能原因：Supabase 项目在海外区域
   - 影响：用户体验一般

---

## ✅ 已完成的优化

### 1. 代码优化

#### ✨ 减少查询字段
```typescript
// 之前：查询所有字段
.from('profiles').select('*')

// 现在：只查询需要的字段
.from('profiles').select('id, username')
```

#### ✨ 添加性能监控
- 在所有数据库查询中添加性能日志
- 可以实时查看每个查询的耗时
- 使用 emoji 标记不同类型的查询

#### ✨ Supabase 客户端配置优化
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // 更安全的认证流程
  },
});
```

---

## 🚀 建议的优化方案

### 方案 1：添加数据库索引 ⭐⭐⭐⭐⭐ （强烈推荐）

**立即可以执行，效果显著**

在 Supabase Dashboard 中：
1. 打开 SQL Editor
2. 运行 `scripts/add-indexes.sql` 中的 SQL
3. 等待索引创建完成（通常几秒钟）

**预期效果：**
- Profile 查询从 1484ms → **<100ms**（减少90%+）
- 排行榜查询从 418ms → **<200ms**（减少50%）

**SQL 脚本位置：** `scripts/add-indexes.sql`

### 方案 2：更改 Supabase 项目区域 ⭐⭐⭐⭐⭐ （最有效）

**如果你的用户主要在中国，这是最有效的方案**

**步骤：**
1. 登录 Supabase Dashboard
2. 选择你的项目
3. 点击 Settings → Infrastructure
4. 查看 "Region"
5. 如果是 US/EU 区域，考虑迁移到 Asia 区域

**注意事项：**
- 迁移区域需要备份数据
- 会产生短暂停机时间
- 建议在低峰期进行

**预期效果：**
- 响应时间从 400ms → **<100ms**
- 用户体验大幅提升

### 方案 3：使用 CDN 缓存 ⭐⭐⭐

**适合排行榜等静态数据**

**实现方式：**
- 在 Next.js 中使用 SWR 或 React Query
- 设置合理的缓存时间（如 30 秒）
- 减少重复查询

```typescript
// 示例：使用 SWR
const { data } = useSWR('/api/leaderboard/simple-reaction', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 30000, // 30秒内不重复请求
});
```

### 方案 4：优化查询结构 ⭐⭐⭐

**已完成部分，可以进一步优化**

**当前查询：**
```typescript
.supabase.from('scores')
  .select('id, test_type, score, details, created_at')
  .eq('user_id', user.id)
```

**可以添加：**
- 分页限制（虽然已经有 order）
- 更精确的 WHERE 条件
- 避免 N+1 查询问题

### 方案 5：使用 Redis 缓存 ⭐⭐⭐⭐

**适合高频访问的数据**

**通过 Supabase Edge Functions 实现：**
```typescript
// 缓存排行榜数据
const cached = await redis.get('leaderboard:simple-reaction');
if (cached) return JSON.parse(cached);

const data = await supabase.from('scores').select(...);
await redis.set('leaderboard:simple-reaction', JSON.stringify(data), 'EX', 30);
```

**预期效果：**
- 缓存命中时响应时间 **<10ms**
- 减少数据库负载

---

## 📋 执行清单

### 立即执行（高优先级）

- [x] ✅ 添加性能监控代码
- [x] ✅ 优化查询字段（只选择需要的字段）
- [x] ✅ 创建性能测试脚本
- [ ] ⭐ **在 Supabase SQL Editor 中运行 `add-indexes.sql`** ← 最重要！
- [ ] ⭐ 考虑将 Supabase 项目迁移到亚洲区域

### 短期优化（1-2周）

- [ ] 实现 Redis 缓存（通过 Edge Functions）
- [ ] 添加 CDN 缓存层
- [ ] 优化排行榜查询（添加分页）

### 长期优化（1-3个月）

- [ ] 监控数据库性能指标
- [ ] 考虑使用 Supabase 的 Read Replicas
- [ ] 实现更智能的缓存策略

---

## 🧪 如何测试优化效果

### 1. 运行性能测试脚本

```bash
node scripts/test-performance.js
```

### 2. 在浏览器中查看性能日志

打开浏览器开发者工具（F12）→ Console 标签，查看：

```
🔐 [性能] 开始获取用户profile...
🔐 [性能] Profile查询完成，耗时: XXXms
✅ [性能] 成功获取profile，总耗时: XXXms
```

### 3. 使用浏览器 Network 标签

1. 打开开发者工具（F12）
2. 切换到 Network 标签
3. 过滤 "supabase"
4. 查看每个请求的 "Time" 列

### 4. 对比优化前后

优化后再运行测试脚本，对比：

| 指标 | 优化前 | 优化后（目标） |
|-----|--------|--------------|
| Profile 查询 | 1484ms | <100ms |
| 排行榜查询 | 418ms | <200ms |
| 平均响应时间 | 856ms | <300ms |

---

## 📞 获取帮助

### Supabase 文档
- [Database Indexes](https://supabase.com/docs/guides/database/database-indexes)
- [Performance Tuning](https://supabase.com/docs/guides/platform/performance)
- [Managing Regions](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)

### 性能监控工具
- Supabase Dashboard → Reports
- 浏览器开发者工具 → Performance 标签
- 本测试脚本：`node scripts/test-performance.js`

---

## 📈 总结

### 当前状态
- ❌ 性能**较慢**，平均 856ms
- ❌ Profile 查询特别慢（1.5秒）
- ✅ 功能正常，查询成功率 100%

### 优化后预期
- ✅ 性能**良好**，平均 <300ms
- ✅ Profile 查询 <100ms
- ✅ 用户体验大幅提升

### 关键行动
**最重要的优化是添加数据库索引**，预计可以将查询速度提升 **50-90%**！

请立即执行 `scripts/add-indexes.sql` 中的 SQL 脚本来获得立竿见影的效果。

---

*报告生成时间: 2026-01-26*
*测试工具: scripts/test-performance.js*
