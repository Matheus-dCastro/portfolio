-- ==============================================================================
-- MIGRAÇÃO SUPABASE: CHAVE DO AGENTE ALOMYR & ATUALIZAÇÃO DO MODELO QWEN 3.8
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)

-- 1. Garante que a coluna groq_api_key existe na tabela agent_configs
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS groq_api_key TEXT;

-- 2. Atualiza o registro 'production' com a chave e modelo mais recente
-- Substitua <SUA_GROQ_API_KEY> pela sua chave Groq (encontrada no .env)
UPDATE public.agent_configs
SET
    groq_api_key = COALESCE(groq_api_key, '<SUA_GROQ_API_KEY>'),
    model_name = 'qwen/qwen3.8-27b',
    updated_at = timezone('utc'::text, now())
WHERE id = 'production';
