/*
  # 修复管理员登录和权限系统

  1. 修复管理员登录问题
  2. 改进权限检查逻辑
  3. 添加更多可管理的网站内容
*/

-- 删除现有的有问题的策略
DROP POLICY IF EXISTS "用户可以查看自己的活动记录" ON user_activities;
DROP POLICY IF EXISTS "用户可以创建自己的活动记录" ON user_activities;
DROP POLICY IF EXISTS "管理员可以查看所有活动记录" ON user_activities;
DROP POLICY IF EXISTS "管理员可以查看管理员信息" ON admins;
DROP POLICY IF EXISTS "超级管理员可以管理所有管理员" ON admins;
DROP POLICY IF EXISTS "所有用户可以查看网站内容" ON site_content;
DROP POLICY IF EXISTS "管理员可以修改网站内容" ON site_content;
DROP POLICY IF EXISTS "用户可以查看所有用户资料" ON user_profiles;
DROP POLICY IF EXISTS "管理员可以查看所有用户资料" ON user_profiles;

-- 重新创建简化的策略
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
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
  );

-- admins 表策略
CREATE POLICY "管理员可以查看管理员信息"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
  );

CREATE POLICY "管理员可以管理管理员"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
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
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email = 'mygalaxycn@qq.com'
    )
  );

-- 添加更多网站内容配置项
INSERT INTO site_content (section, content_key, content_value) VALUES
('home', 'title', '"给生活以记录"'),
('home', 'subtitle', '"探索无限可能的银河系里的地球"'),
('home', 'background_image', '"https://images.unsplash.com/photo-1752028228080-60eabd31e649"'),

('about', 'title', '"关于我"'),
('about', 'cards', '[
  {"title": "🏫 大学牲 | 白日梦患者", "description": "在学术的海洋中遨游，在梦想的天空中翱翔"},
  {"title": "🌞 白日梦患者 | 不会拍照但摄影爱好者", "description": "用心感受世界的美好，用镜头记录生活的点滴"},
  {"title": "💬 吐槽专家 | 星际迷航粉丝", "description": "热爱科幻，相信未来，永远保持好奇心"}
]'),
('about', 'idols_title', '"🎵 我的音乐偶像"'),
('about', 'idols_description', '"这些艺术家的音乐陪伴我穿越星际，点燃创作灵感"'),

('projects', 'title', '"我的项目"'),
('projects', 'items', '[
  {
    "title": "📸 NCC-17039 Photo System",
    "url": "https://ps.ncc17039.eu.org/",
    "status": "已部署",
    "description": "基于先进量子存储技术的星际图像管理系统，为银河系探索者提供高效的视觉数据归档与检索服务。",
    "tags": ["Quantum Storage", "Neural Interface", "Holographic Display"]
  },
  {
    "title": "📝 个人博客",
    "url": "https://b.ncc17039.eu.org/",
    "status": "已部署",
    "description": "运行在星际网络上的个人思维记录站点，采用超光速数据传输协议，实时同步来自银河系各个角落的见解与思考。",
    "tags": ["Hyperdrive Engine", "Temporal Sync", "Cosmic Database"]
  }
]'),

('contact', 'title', '"联系我"'),
('contact', 'subtitle', '"通过以下任何方式都能快速联系到我！"'),
('contact', 'methods', '[
  {
    "icon": "📧",
    "title": "量子邮箱",
    "value": "mygalaxycn@qq.com",
    "type": "email",
    "description": "工作联系首选"
  },
  {
    "icon": "🎮",
    "title": "Discord",
    "value": "julian_bashir",
    "type": "text",
    "description": "游戏聊天首选"
  },
  {
    "icon": "⚡",
    "title": "GitHub",
    "value": "https://github.com/NCC-17039",
    "type": "link",
    "description": "开源项目和贡献"
  }
]'),

('site', 'logo_url', '"https://user-assets.sxlcdn.com/images/1046536/FpqadbyY9n7LXaAR77KQr9di7xxP.png"'),
('site', 'site_name', '"NCC-17039"'),
('site', 'site_subtitle', '"个人网站"'),
('site', 'footer_text', '"银河系里的地球"'),
('site', 'theme_color', '"#64ffda"'),
('site', 'background_other', '"https://images.unsplash.com/photo-1752026631135-41117a9a7c1e"')

ON CONFLICT (section, content_key) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  updated_at = now();