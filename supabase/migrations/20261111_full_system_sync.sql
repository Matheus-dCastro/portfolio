-- ==============================================================================
-- MIGRATION: SINCRONIZAÇÃO COMPLETA DE TABELAS, STORAGE E RLS - MATHEUS DE CASTRO
-- Arquivo: supabase/migrations/20261111_full_system_sync.sql
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Cria tabelas de hobbies dinâmicos, blog posts, perfil e buckets de armazenamento.
-- ==============================================================================

-- 1. TABELA DE CARDS DE INTERESSES & HOBBIES DINÂMICOS
CREATE TABLE IF NOT EXISTS public.hobbies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category VARCHAR(100) NOT NULL DEFAULT 'Hobby',
    layout VARCHAR(50) DEFAULT '',
    title_pt VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    photo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hobbies_order ON public.hobbies(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_hobbies_published ON public.hobbies(is_published);

ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Hobbies" ON public.hobbies;
CREATE POLICY "Public Read Hobbies" ON public.hobbies
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Hobbies" ON public.hobbies;
CREATE POLICY "Admin Insert Hobbies" ON public.hobbies
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Hobbies" ON public.hobbies;
CREATE POLICY "Admin Update Hobbies" ON public.hobbies
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Hobbies" ON public.hobbies;
CREATE POLICY "Admin Delete Hobbies" ON public.hobbies
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- 2. TABELA DE CONFIGURAÇÃO DE PERFIL
CREATE TABLE IF NOT EXISTS public.profile_configs (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'production',
    photo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profile_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Profile Config" ON public.profile_configs;
CREATE POLICY "Public Read Profile Config" ON public.profile_configs
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin Manage Profile Config" ON public.profile_configs;
CREATE POLICY "Admin Manage Profile Config" ON public.profile_configs
    FOR ALL TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. TABELA DE BLOG POSTS (TECH & ALOMYR)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel VARCHAR(50) NOT NULL DEFAULT 'tech',
    title_pt VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    summary_pt TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image TEXT,
    youtube_url TEXT,
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    content_pt TEXT NOT NULL,
    content_en TEXT NOT NULL,
    related_project_id TEXT,
    related_article_id TEXT,
    author VARCHAR(100) NOT NULL DEFAULT 'Matheus de Castro',
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    read_time VARCHAR(50) NOT NULL DEFAULT '5 min',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_channel ON public.blog_posts(channel);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts(published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Blog Posts" ON public.blog_posts;
CREATE POLICY "Public Read Blog Posts" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Insert Blog Posts" ON public.blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Update Blog Posts" ON public.blog_posts
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Delete Blog Posts" ON public.blog_posts
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- 4. ADICIONAR COLUNA custom_hobby_json e blog_config_json EM agent_configs
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS custom_hobby_json JSONB;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS blog_gateway_config JSONB;

-- 5. BUCKETS DE STORAGE SUPABASE
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('documents', 'documents', true),
    ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage
DROP POLICY IF EXISTS "Public Read Storage Documents" ON storage.objects;
CREATE POLICY "Public Read Storage Documents" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('documents', 'images'));

DROP POLICY IF EXISTS "Admin Insert Storage Documents" ON storage.objects;
CREATE POLICY "Admin Insert Storage Documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('documents', 'images'));

DROP POLICY IF EXISTS "Admin Update Storage Documents" ON storage.objects;
CREATE POLICY "Admin Update Storage Documents" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('documents', 'images'))
    WITH CHECK (bucket_id IN ('documents', 'images'));

DROP POLICY IF EXISTS "Admin Delete Storage Documents" ON storage.objects;
CREATE POLICY "Admin Delete Storage Documents" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('documents', 'images'));

-- Grants para roles do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
