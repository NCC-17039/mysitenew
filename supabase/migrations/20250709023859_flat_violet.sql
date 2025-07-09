/*
  # 创建用户资料表

  1. 新表
    - `user_profiles`
      - `id` (uuid, 主键, 关联 auth.users)
      - `username` (text, 用户名)
      - `email` (text, 邮箱)
      - `avatar_url` (text, 头像链接)
      - `bio` (text, 个人简介)
      - `created_at` (timestamptz, 创建时间)
      - `updated_at` (timestamptz, 更新时间)

  2. 安全设置
    - 启用 RLS
    - 用户只能查看和编辑自己的资料
    - 允许注册用户创建资料
*/

-- 创建用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户可以查看所有公开资料
CREATE POLICY "用户可以查看所有资料"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 创建策略：用户只能插入自己的资料
CREATE POLICY "用户可以创建自己的资料"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 创建策略：用户只能更新自己的资料
CREATE POLICY "用户可以更新自己的资料"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 创建策略：用户只能删除自己的资料
CREATE POLICY "用户可以删除自己的资料"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户资料表创建更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();