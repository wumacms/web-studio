-- Web Studio - Supabase 数据库架构 (同步自远程数据库状态)

-- ==========================================
-- 1. 基础配置与扩展
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. 表结构定义
-- ==========================================

-- 用户档案表 (关联 Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_avatar_url TEXT,
  github_token TEXT,
  github_id TEXT,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 站点表 (用户创建的网站)
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  published BOOLEAN DEFAULT false,
  repo_name TEXT,
  repo_url TEXT,
  pages_url TEXT,
  custom_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 页面表 (网站下的页面)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  seo_config JSONB DEFAULT '{}'::jsonb,
  translations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 区块实例表 (页面中的内容区块)
CREATE TABLE IF NOT EXISTS public.block_instances (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  source_template_id TEXT,
  copied_html_code TEXT NOT NULL,
  copied_schema JSONB NOT NULL,
  props_data JSONB NOT NULL,
  translations JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 站点全局设置 (导航栏、页脚、多语言配置)
CREATE TABLE IF NOT EXISTS public.site_globals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nav_config JSONB DEFAULT '{}'::jsonb,
  footer_config JSONB DEFAULT '{}'::jsonb,
  i18n_config JSONB DEFAULT '{"enabled": ["en"], "primary": "en"}'::jsonb
);

-- 区块模板表 (市场中的基础区块)
CREATE TABLE IF NOT EXISTS public.block_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  html_code TEXT NOT NULL,
  schema JSONB NOT NULL,
  preview_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  origin TEXT DEFAULT 'SYSTEM'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 页面模板表 (市场中的完整页面设计)
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 站点模板表 (市场中的整站模板)
CREATE TABLE IF NOT EXISTS public.site_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  nav_config JSONB,
  footer_config JSONB,
  i18n_config JSONB,
  preview_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 收藏表 (用户收藏的模板)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, item_type, item_id)
);

-- ==========================================
-- 3. RLS 安全策略配置 (Row Level Security)
-- ==========================================

-- 启用所有表的 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_globals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 策略定义
CREATE POLICY "Profiles are managed by owners" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Sites are managed by owners" ON public.sites FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Pages are managed by site owners" ON public.pages FOR ALL 
USING (EXISTS (SELECT 1 FROM public.sites WHERE id = site_id AND profile_id = auth.uid()));
CREATE POLICY "Blocks are managed by site owners" ON public.block_instances FOR ALL 
USING (EXISTS (SELECT 1 FROM public.pages p JOIN public.sites s ON p.site_id = s.id WHERE p.id = page_id AND s.profile_id = auth.uid()));
CREATE POLICY "Globals are managed by site owners" ON public.site_globals FOR ALL 
USING (EXISTS (SELECT 1 FROM public.sites WHERE id = site_id AND profile_id = auth.uid()));
CREATE POLICY "Templates are viewable by public or owners" ON public.block_templates FOR SELECT 
USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Page templates are viewable by public or owners" ON public.page_templates FOR SELECT 
USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Site templates are viewable by public or owners" ON public.site_templates FOR SELECT 
USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Favorites are managed by owners" ON public.favorites FOR ALL USING (auth.uid() = profile_id);
