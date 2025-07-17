/*
  # 修复RLS策略和无限递归错误

  1. 问题修复
    - 修复admins表的无限递归问题
    - 修复user_activities表的RLS策略
    - 简化权限检查逻辑
    - 添加缺失的权限策略

  2. 安全策略
    - 用户只能查看和创建自己的活动记录
    - 管理员可以查看所有数据
    - 避免循环依赖的权限检查
*/

-- 删除所有现有的有问题的策略
DROP POLICY IF EXISTS "用户可以查看自己的活动日志" ON user_activities;
DROP POLICY IF EXISTS "管理员可以查看所有活动日志" ON user_activities;
DROP POLICY IF EXISTS "系统可以创建活动日志" ON user_activities;
DROP POLICY IF EXISTS "管理员可以查看所有管理员信息" ON admins;
DROP POLICY IF EXISTS "超级管理员可以管理管理员" ON admins;

-- 重新创建简化的、无循环依赖的策略

-- user_activities 表策略
CREATE POLICY "用户可以查看自己的活动记录"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的活动记录"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有活动记录"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'mygalaxycn@qq.com'
  );

-- admins 表策略 - 避免无限递归
CREATE POLICY "管理员可以查看管理员信息"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'mygalaxycn@qq.com'
    OR user_id = auth.uid()
  );

CREATE POLICY "超级管理员可以管理所有管理员"
  ON admins
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'mygalaxycn@qq.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mygalaxycn@qq.com');

-- user_profiles 表策略优化
DROP POLICY IF EXISTS "用户可以查看所有资料" ON user_profiles;
CREATE POLICY "用户可以查看所有用户资料"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "管理员可以查看所有用户资料"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'mygalaxycn@qq.com'
  );

-- site_content 表策略
CREATE POLICY "所有用户可以查看网站内容"
  ON site_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "管理员可以修改网站内容"
  ON site_content
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'mygalaxycn@qq.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mygalaxycn@qq.com');

-- 创建管理员账号（如果不存在）
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'mygalaxycn@qq.com',
  crypt('ziruiez1942', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 确保管理员记录存在
INSERT INTO admins (
  email,
  role,
  permissions
) VALUES (
  'mygalaxycn@qq.com',
  'super_admin',
  '{"manage_users": true, "manage_content": true, "view_analytics": true, "delete_users": true}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  permissions = '{"manage_users": true, "manage_content": true, "view_analytics": true, "delete_users": true}'::jsonb;