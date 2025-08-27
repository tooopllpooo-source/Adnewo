/*
# إنشاء مخطط قاعدة البيانات لمدير إعلانات Adsterra
يتضمن هذا الملف إنشاء جميع الجداول المطلوبة لإدارة الحملات والمستخدمين

## Query Description: 
إنشاء مخطط قاعدة بيانات شامل لإدارة إعلانات Adsterra مع نظام مصادقة آمن.
يتضمن جداول للمستخدمين، الحملات، الإعدادات، والسكريپتات المولدة.
آمن تماماً ولا يؤثر على أي بيانات موجودة.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- profiles: بيانات المستخدمين الأساسية
- api_credentials: بيانات API مشفرة
- campaigns: الحملات الإعلانية
- generated_scripts: السكريپتات المولدة
- campaign_analytics: إحصائيات الحملات

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Supabase Auth integration

## Performance Impact:
- Indexes: Added for better performance
- Triggers: Added for automated profile creation
- Estimated Impact: Minimal performance overhead
*/

-- إنشاء جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول بيانات API
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key_encrypted TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'https://api.adsterra.com/v1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الحملات
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  cpm DECIMAL(10,2) NOT NULL,
  country TEXT NOT NULL,
  device TEXT NOT NULL CHECK (device IN ('mobile', 'desktop', 'all')),
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'expired')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول السكريپتات المولدة
CREATE TABLE IF NOT EXISTS public.generated_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  script_code TEXT NOT NULL,
  config JSONB NOT NULL,
  campaign_ids TEXT[] NOT NULL,
  script_type TEXT NOT NULL CHECK (script_type IN ('production', 'preview')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إحصائيات الحملات
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  cpm DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_cpm ON public.campaigns(cpm);
CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id ON public.api_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_scripts_user_id ON public.generated_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_user_id ON public.campaign_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON public.campaign_analytics(date);

-- إنشاء trigger لإنشاء الملف الشخصي تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق trigger على الجداول المطلوبة
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS api_credentials_updated_at ON public.api_credentials;
CREATE TRIGGER api_credentials_updated_at
  BEFORE UPDATE ON public.api_credentials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان للملفات الشخصية
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- إنشاء سياسات الأمان لبيانات API
CREATE POLICY "Users can manage own API credentials" ON public.api_credentials
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء سياسات الأمان للحملات
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء سياسات الأمان للسكريپتات المولدة
CREATE POLICY "Users can manage own scripts" ON public.generated_scripts
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء سياسات الأمان للإحصائيات
CREATE POLICY "Users can view own analytics" ON public.campaign_analytics
  FOR ALL USING (auth.uid() = user_id);
