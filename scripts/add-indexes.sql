-- Supabase 性能优化 SQL 脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 为 scores 表添加索引
-- 在 test_type 和 score 上创建复合索引，优化排行榜查询
CREATE INDEX IF NOT EXISTS idx_scores_test_type_score
ON scores(test_type, score DESC);

-- 2. 为 scores 表添加 user_id 索引
-- 优化用户成绩查询
CREATE INDEX IF NOT EXISTS idx_scores_user_id
ON scores(user_id);

-- 3. 为 scores 表添加 created_at 索引
-- 优化按时间排序的查询
CREATE INDEX IF NOT EXISTS idx_scores_created_at
ON scores(created_at DESC);

-- 4. 为 profiles 表添加索引
-- 优化用户信息查询
CREATE INDEX IF NOT EXISTS idx_profiles_id
ON profiles(id);

-- 5. 验证索引是否创建成功
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND tablename IN ('scores', 'profiles')
ORDER BY
    tablename, indexname;
