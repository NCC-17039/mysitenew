/*
  # 创建管理员系统和网站内容管理

  1. 新表
    - `admins` - 管理员表
    - `site_content` - 网站内容管理表
    - `user_activities` - 用户活动日志表

  2. 安全策略
    - 管理员表启用RLS
    - 网站内容表启用RLS，只有管理员可以修改
    - 用户活动日志表启用RLS

  3. 管理员权限
    - 可以查看所有用户信息
    - 可以修改网站内容
    - 可以查看用户活动日志
*/

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions jsonb DEFAULT '{"manage_users": true, "manage_content": true, "view_analytics": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建网站内容管理表
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL, -- 'home', 'about', 'projects', 'contact'
  content_key text NOT NULL,
  content_value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, content_key)
);

-- 创建用户活动日志表
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'login', 'logout', 'register', 'profile_update'
  activity_data jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 启用行级安全
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- 管理员表策略
CREATE POLICY "管理员可以查看所有管理员信息"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "超级管理员可以管理管理员"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() AND a.role = 'super_admin'
    )
  );

-- 网站内容表策略
CREATE POLICY "所有人可以查看网站内容"
  ON site_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "管理员可以修改网站内容"
  ON site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid()
    )
  );

-- 用户活动日志策略
CREATE POLICY "用户可以查看自己的活动日志"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "管理员可以查看所有活动日志"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "系统可以创建活动日志"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_admins_updated_at'
  ) THEN
    CREATE TRIGGER update_admins_updated_at
      BEFORE UPDATE ON admins
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_content_updated_at'
  ) THEN
    CREATE TRIGGER update_site_content_updated_at
      BEFORE UPDATE ON site_content
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 插入默认网站内容
INSERT INTO site_content (section, content_key, content_value) VALUES
('home', 'title', '"给生活以记录"'),
('home', 'background_image', '"https://images.unsplash.com/photo-1752028228080-60eabd31e649"'),
('about', 'cards', '[
  {"title": "🏫 大学牲 | 白日梦患者", "content": ""},
  {"title": "🌞 白日梦患者 | 不会拍照但摄影爱好者", "content": ""},
  {"title": "💬 吐槽专家 | 星际迷航粉丝", "content": ""}
]'),
('about', 'idols', '[
  {"name": "THE CHAINSMOKERS", "icon": "🎧", "description": "电音界的传奇双人组", "url": "https://thechainsmokers.com/"},
  {"name": "ALAN WALKER", "icon": "🎭", "description": "神秘面具下的音乐天才", "url": "https://alanwalker.com/"},
  {"name": "WALKERWORLD", "icon": "🌍", "description": "Walker宇宙的官方门户", "url": "https://www.worldofwalker.com/"}
]'),
('projects', 'projects', '[
  {
    "title": "📸 NCC-17039 Photo System",
    "status": "completed",
    "description": "基于先进量子存储技术的星际图像管理系统，为银河系探索者提供高效的视觉数据归档与检索服务。采用分布式架构，确保在任何星系都能快速访问珍贵的宇宙影像。",
    "tags": ["Quantum Storage", "Neural Interface", "Holographic Display"],
    "url": "https://ps.ncc17039.eu.org/"
  },
  {
    "title": "📝 个人博客",
    "status": "completed", 
    "description": "运行在星际网络上的个人思维记录站点，采用超光速数据传输协议，实时同步来自银河系各个角落的见解与思考。集成了多维度内容展示引擎，让每一篇文章都能在时空中留下永恒的印记。",
    "tags": ["Hyperdrive Engine", "Temporal Sync", "Cosmic Database"],
    "url": "https://b.ncc17039.eu.org/"
  }
]')
ON CONFLICT (section, content_key) DO NOTHING;