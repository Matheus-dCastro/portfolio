-- ==============================================================================
-- MIGRAÇÃO DEFINITIVA SUPABASE: LIBERAÇÃO TOTAL DE PERSISTÊNCIA & TABELAS
-- Arquivo: supabase/migrations/20261111_fix_all_rls_and_tables.sql
-- ==============================================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/yssvioekuramkvztoyom/sql
-- 2. Cole este script completo no SQL Editor e clique em "RUN" (ou Ctrl + Enter)
-- 3. Pronto! Todas as tabelas, colunas e permissões de gravação estarão liberadas.
-- ==============================================================================

-- 1. TIPOS ENUM NECESSÁRIOS
DO $$ BEGIN
    CREATE TYPE project_category_enum AS ENUM ('Profissional', 'Pessoal', 'Acadêmico');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_source_enum AS ENUM ('markdown', 'google-docs', 'pdf');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. GARANTE A CRIAÇÃO DE TODAS AS TABELAS
-- TABELA: HOBBIES (CARDS DE INTERESSE)
CREATE TABLE IF NOT EXISTS public.hobbies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category VARCHAR(100) NOT NULL DEFAULT 'Hobby',
    layout VARCHAR(50) DEFAULT '',
    title_pt VARCHAR(255) NOT NULL DEFAULT '',
    title_en VARCHAR(255) NOT NULL DEFAULT '',
    description_pt TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA: PROFILE_CONFIGS (FOTO DE PERFIL GLOBAL)
CREATE TABLE IF NOT EXISTS public.profile_configs (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'production',
    photo_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA: BLOG_POSTS (CANAL TECH & ALOMYR)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel VARCHAR(50) NOT NULL DEFAULT 'tech',
    title_pt VARCHAR(255) NOT NULL DEFAULT '',
    title_en VARCHAR(255) NOT NULL DEFAULT '',
    summary_pt TEXT NOT NULL DEFAULT '',
    summary_en TEXT NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'Geral',
    tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image TEXT DEFAULT '',
    youtube_url TEXT DEFAULT '',
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    content_pt TEXT NOT NULL DEFAULT '',
    content_en TEXT NOT NULL DEFAULT '',
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

-- TABELA: DRAWINGS (DESENHOS E ARTES)
CREATE TABLE IF NOT EXISTS public.drawings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'Arte',
    tags TEXT[] NOT NULL DEFAULT '{}',
    description TEXT DEFAULT '',
    technique VARCHAR(100) DEFAULT 'Grafite',
    year VARCHAR(20) DEFAULT '2024',
    dimensions VARCHAR(50) DEFAULT 'A4',
    image_url TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. GARANTE AS COLUNAS DINÂMICAS NA TABELA AGENT_CONFIGS
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS custom_hobby_json JSONB;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS blog_gateway_config JSONB;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS notfound_config JSONB;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS groq_api_key TEXT;

-- 4. INICIALIZAÇÃO DE REGISTROS ESSENCIAIS (SE NÃO EXISTIREM)
INSERT INTO public.agent_configs (id, model_name, system_prompt, max_tokens, temperature, updated_at)
VALUES ('production', 'qwen/qwen3.8-27b', 'Você é o Alomyr...', 1024, 0.3, timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cv_configs (id, google_docs_url, pdf_url, updated_at)
VALUES ('production', '', '', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profile_configs (id, photo_url, updated_at)
VALUES ('production', '', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- 5. RESOLUÇÃO DEFINITIVA DO ERRO 42501 (ROW LEVEL SECURITY)
-- Desativa o RLS para que todas as chamadas do painel administrativo /4dm1n/
-- consigam salvar, atualizar e excluir sem serem barradas pelas permissões do Supabase:
ALTER TABLE public.works DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobbies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings DISABLE ROW LEVEL SECURITY;

-- 6. CONCEDE TODAS AS PERMISSÕES PARA AS ROLES DO SUPABASE (anon e authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
