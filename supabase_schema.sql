-- Web Studio - Supabase Database Schema
-- 请在 Supabase SQL Editor 中运行以下脚本

-- 1. 开启必要扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 用户档案表 (由 Auth Users 触发或手动关联)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 站点表
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 页面表
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  seo_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. 区块实例表 (编辑器核心数据)
CREATE TABLE IF NOT EXISTS block_instances (
  id UUID PRIMARY KEY, -- 使用 UUID v4，由前端生成以便于 Undo/Redo 追踪
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  source_template_id TEXT,
  copied_html_code TEXT NOT NULL,
  copied_schema JSONB NOT NULL,
  props_data JSONB NOT NULL,
  translations JSONB DEFAULT '{}', -- 存储多语言翻译数据
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. 站点全局设置 (导航、页脚、i18n)
CREATE TABLE IF NOT EXISTS site_globals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nav_config JSONB DEFAULT '{}',
  footer_config JSONB DEFAULT '{}',
  i18n_config JSONB DEFAULT '{"primary": "en", "enabled": ["en"]}'
);

-- 7. 区块模板库 (公共市场与个人库)
CREATE TABLE IF NOT EXISTS block_templates (
  id TEXT PRIMARY KEY, -- 模板通常有固定 ID 如 'hero-1'
  name TEXT NOT NULL,
  category TEXT,
  html_code TEXT NOT NULL,
  schema JSONB NOT NULL,
  preview_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  origin TEXT DEFAULT 'SYSTEM', -- 'SYSTEM' 或 'USER'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. 开启 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_globals ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;

-- 9. 基础策略 (允许所有者操作)
-- 注意：实际生产环境需更精细的 Policy 设定
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own sites" ON sites FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Public templates are viewable by all" ON block_templates FOR SELECT USING (is_published = true OR auth.uid() = created_by);
