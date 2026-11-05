-- ==============================================================================
-- MIGRAÇÃO SUPABASE: CADASTRO DO PROJETO PORTFOLIO & VÍNCULO DE ARTIGOS NO BLOG
-- ==============================================================================
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)

-- 1. Garante que a coluna related_article_id existe no blog (se tabela blog_posts for usada)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
        ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS related_article_id TEXT;
    END IF;
END $$;

-- 2. Insere/Atualiza o Projeto Pessoal do Portfólio na tabela 'works'
INSERT INTO public.works (
    id,
    title,
    category,
    tags,
    short_description,
    about_context,
    github_url,
    demo_url,
    content_type,
    content,
    related_article_id,
    display_order,
    is_published,
    created_at,
    updated_at
) VALUES (
    'portfolio-ecosystem',
    'Portfolio Web & Dual-Blog Ecosystem <!-- BILINGUAL_SPLIT --> Portfólio Web, Ecossistema de Blog & Agente IA',
    'Pessoal',
    ARRAY['React', 'Supabase', 'Vite', 'Edge Functions', 'AI Agent']::TEXT[],
    'Personal high-performance portfolio featuring a dual-blog ecosystem, serverless Edge Functions for isolated LLM inference, and zero secrets in localStorage. <!-- BILINGUAL_SPLIT --> Portfólio web de alta performance com ecossistema de blog duplo, Edge Functions serverless para inferência isolada de LLMs e zero credenciais no cliente.',
    'Complete engineering and visual architecture of Matheus de Castro''s personal website. Built with Vite, React, Supabase Cloud, serverless edge functions for secure inference, and custom cyber-minimal UI. <!-- BILINGUAL_SPLIT --> Arquitetura técnica e visual completa do portfólio pessoal de Matheus de Castro. Construído com Vite, React, Supabase Cloud, edge functions serverless para inferência segura e UI cyber-minimalista.',
    'https://github.com/Matheus-dCastro/portfolio',
    'https://matheusdecastro.com/',
    'markdown',
    '# Portfólio Web, Ecossistema de Blog & Agente IA

![Preview da Interface do Portfólio](/portfolio-preview.png)

Uma plataforma web moderna e ultrarrápida projetada para centralizar a presença profissional, artigos técnicos, laboratório de arte/cultura geek e assistente de IA conversacional.

### 1. Zero Secrets no Cliente & Edge Functions
Nenhuma credencial sensível ou chave de API de LLM trafega ou fica persistida no `localStorage` do visitante. Todas as requisições de chat são despachadas via `supabase.functions.invoke(''chat-qwen'')`, autenticadas e com rate-limiting na infraestrutura em nuvem.

### 2. Roteamento Estático Multi-Page no Vite
Configuração avançada do Rollup / Vite com múltiplos entrypoints HTML estáticos (`blog/index.html`, `blog/alomyr/index.html`, `4dm1n/index.html`), viabilizando recargas diretas de página (F5) em qualquer sub-rota sem erro 404 em hospedagens estáticas.

### 3. Painel Administrativo Moderado
Área restrita de moderação com autenticação por sessão, reordenação interativa de projetos e desenhos via drag-and-drop, editor Markdown com preview em tempo real e moderação de tags e mídias ricas (vídeos YouTube e galerias de fotos).',
    NULL,
    0,
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    short_description = EXCLUDED.short_description,
    about_context = EXCLUDED.about_context,
    github_url = EXCLUDED.github_url,
    demo_url = EXCLUDED.demo_url,
    content = EXCLUDED.content,
    related_article_id = EXCLUDED.related_article_id,
    updated_at = timezone('utc'::text, now());
