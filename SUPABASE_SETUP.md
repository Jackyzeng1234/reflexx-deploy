# Supabase 数据库设置指南

## 📋 前置条件

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 创建新项目（免费即可，无需信用卡）
4. 等待项目初始化完成（约1-2分钟）

## 🔑 获取API密钥

1. 进入项目Dashboard
2. 点击左侧菜单 **Settings** → **API**
3. 复制以下信息：
   - Project URL（类似 `https://xxxxx.supabase.co`）
   - `anon` `public`密钥

4. 将这些值填入项目的 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 创建数据库表

### 方式1：使用SQL Editor（推荐）

1. 在Supabase Dashboard中，点击左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 复制下面的SQL代码并执行

### 方式2：使用Table Editor

1. 点击左侧菜单 **Table Editor**
2. 点击 **New Table**
3. 按照下面的结构创建表

---

## 🗄️ 表结构

### 表1: `profiles`（用户资料表）

```sql
-- 创建profiles表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX profiles_username_idx ON profiles(username);

-- 启用RLS（Row Level Security）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的资料
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 允许用户插入自己的资料
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 允许所有人查看用户名（用于排行榜）
CREATE POLICY "Anyone can view usernames"
  ON profiles FOR SELECT
  USING (true);
```

### 表2: `scores`（成绩表）

```sql
-- 创建scores表
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  score NUMERIC NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引（提升查询性能）
CREATE INDEX scores_user_test_idx ON scores(user_id, test_type);
CREATE INDEX scores_test_score_idx ON scores(test_type, score DESC);
CREATE INDEX scores_created_idx ON scores(created_at DESC);

-- 启用RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的成绩
CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户插入自己的成绩
CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许所有人查看成绩（用于排行榜）
CREATE POLICY "Anyone can view scores"
  ON scores FOR SELECT
  USING (true);
```

---

## 🤖 自动创建用户资料

当新用户注册时，自动创建对应的profile记录：

1. 在Supabase Dashboard中，点击 **Database** → **Triggers**
2. 点击 **New Trigger**
3. 使用以下SQL：

```sql
-- 自动创建profile触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ 验证设置

### 测试1：检查表是否创建成功

在SQL Editor中运行：
```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

应该看到：
- `profiles`
- `scores`

### 测试2：查看表结构

```sql
-- 查看profiles表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
```

### 测试3：检查RLS策略

```sql
-- 查看profiles表的策略
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 查看scores表的策略
SELECT * FROM pg_policies WHERE tablename = 'scores';
```

---

## 🎯 test_type 允许的值

以下是我们支持的测试类型：

```
simple-reaction         // 简单反应测试
auditory-reaction       // 声音反应测试
choice-reaction         // 选择反应测试
click-speed             // 点击速度测试
sequence-memory         // 序列记忆测试
typing                  // 打字速度测试
chimp                   // 黑猩猩测试
aim-trainer             // 瞄准训练
stroop                  // 斯特鲁普测试
number-memory           // 数字记忆测试
```

---

## 📝 details字段说明

`scores`表的`details`字段是JSONB类型，可以存储额外信息：

### 示例数据：

```json
// 简单反应测试
{
  "times": [200, 195, 210, 205],
  "rounds": 5
}

// 点击速度测试
{
  "clicks": 250,
  "duration": 5
}

// 打字速度测试
{
  "wpm": 65,
  "accuracy": 95.5
}

// 黑猩猩测试
{
  "level": 5,
  "numbers": 4
}

// 瞄准训练
{
  "score": 35,
  "accuracy": 87
}

// 序列记忆测试
{
  "level": 8
}

// 数字记忆测试
{
  "digits": 7
}

// 斯特鲁普测试
{
  "score": 18,
  "averageReactionTime": 450
}
```

---

## 🚨 常见问题

### Q1: SQL执行报错？
**A:** 确保你有足够的权限，使用项目所有者账号登录

### Q2: 触发器创建失败？
**A:** 检查函数是否先创建，确保语法正确

### Q3: RLS策略不生效？
**A:**
1. 确认RLS已启用：`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. 查看策略：`SELECT * FROM pg_policies WHERE tablename = 'table_name';`

### Q4: 如何重置数据？
**A:** 在SQL Editor中运行：
```sql
-- 删除所有成绩（保留表结构）
TRUNCATE scores CASCADE;

-- 删除所有用户资料
TRUNCATE profiles CASCADE;
```

---

## 📚 下一步

完成数据库设置后：
1. ✅ 运行项目：`npm run dev`
2. ✅ 注册/登录测试账号
3. ✅ 提交成绩测试
4. ✅ 查看排行榜

需要帮助？查看文档：[https://supabase.com/docs](https://supabase.com/docs)
