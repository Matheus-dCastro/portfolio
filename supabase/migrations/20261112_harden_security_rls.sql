-- ==============================================================================
-- BLINDAGEM TOTAL DE SEGURANCA: RLS, CONTROLE DE ACESSO E PROTECAO DE SECRETS
-- Data: 2026-11-12
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- para garantir que somente Matheus de Castro possa alterar dados ou arquivos.

-- 1. Funcao central de validacao de Administrador (Email ou GitHub Username)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'matheus.vsf.castro.25@gmail.com'
    OR lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'user_name', '')) = 'matheus-dcastro'
    OR lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'preferred_username', '')) = 'matheus-dcastro'
  );
$$;

-- 2. Sanitizacao da tabela agent_configs (Remocao de chaves de API expostas)
UPDATE public.agent_configs
SET groq_api_key = NULL
WHERE id = 'production';

-- 3. Blindagem de RLS: WORKS (Projetos)
DROP POLICY IF EXISTS "Admin Insert Works" ON public.works;
CREATE POLICY "Admin Insert Works" ON public.works
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Works" ON public.works;
CREATE POLICY "Admin Update Works" ON public.works
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Works" ON public.works;
CREATE POLICY "Admin Delete Works" ON public.works
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 4. Blindagem de RLS: ARTICLES (Artigos)
DROP POLICY IF EXISTS "Admin Insert Articles" ON public.articles;
CREATE POLICY "Admin Insert Articles" ON public.articles
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Articles" ON public.articles;
CREATE POLICY "Admin Update Articles" ON public.articles
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Articles" ON public.articles;
CREATE POLICY "Admin Delete Articles" ON public.articles
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 5. Blindagem de RLS: THOUGHTS (Pensamentos)
DROP POLICY IF EXISTS "Admin Insert Thoughts" ON public.thoughts;
CREATE POLICY "Admin Insert Thoughts" ON public.thoughts
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Thoughts" ON public.thoughts;
CREATE POLICY "Admin Update Thoughts" ON public.thoughts
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Thoughts" ON public.thoughts;
CREATE POLICY "Admin Delete Thoughts" ON public.thoughts
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 6. Blindagem de RLS: CV_CONFIGS (Curriculo)
DROP POLICY IF EXISTS "Admin Manage CV Config" ON public.cv_configs;
CREATE POLICY "Admin Manage CV Config" ON public.cv_configs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. Blindagem de RLS: AGENT_CONFIGS (Configuracoes do Agente Alomyr)
DROP POLICY IF EXISTS "Admin Manage Agent Config" ON public.agent_configs;
CREATE POLICY "Admin Manage Agent Config" ON public.agent_configs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. Blindagem de RLS: DRAWINGS (Desenhos)
DROP POLICY IF EXISTS "Admin Insert Drawings" ON public.drawings;
CREATE POLICY "Admin Insert Drawings" ON public.drawings
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Drawings" ON public.drawings;
CREATE POLICY "Admin Update Drawings" ON public.drawings
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Drawings" ON public.drawings;
CREATE POLICY "Admin Delete Drawings" ON public.drawings
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 9. Blindagem de RLS: BLOG_POSTS (Postagens do Blog)
DROP POLICY IF EXISTS "Admin Insert Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Insert Blog Posts" ON public.blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Update Blog Posts" ON public.blog_posts
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Delete Blog Posts" ON public.blog_posts
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 10. Blindagem de RLS: STORAGE OBJECTS (Bucket 'documents')
DROP POLICY IF EXISTS "Admin Document Upload" ON storage.objects;
CREATE POLICY "Admin Document Upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Document Update" ON storage.objects;
CREATE POLICY "Admin Document Update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'documents' AND public.is_admin())
    WITH CHECK (bucket_id = 'documents' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Document Delete" ON storage.objects;
CREATE POLICY "Admin Document Delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND public.is_admin());
