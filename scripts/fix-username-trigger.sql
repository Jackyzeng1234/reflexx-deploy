-- 修改触发器，优先使用用户注册时提供的用户名

-- 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 重新创建函数，检查 metadata 中是否有 username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
BEGIN
  -- 检查用户 metadata 中是否有 username
  user_username := NEW.raw_user_meta_data->>'username';

  -- 如果 metadata 中没有 username，则使用邮箱前缀
  IF user_username IS NULL OR user_username = '' THEN
    user_username := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- 插入或更新 profiles 表
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, user_username)
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器已创建
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
