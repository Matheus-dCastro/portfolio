import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof globalThis !== "undefined" && globalThis.process?.env?.VITE_SUPABASE_URL);

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof globalThis !== "undefined" && globalThis.process?.env?.VITE_SUPABASE_ANON_KEY);

// Flag exportada para sabermos se devemos usar Nuvem ou LocalStorage (Fallback)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Inicializa o cliente do Supabase apenas se as variáveis existirem
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Função utilitária para testar a conexão com o Supabase.
 * Útil para detectar falhas de rede (offline) e ativar o fallback para o localStorage.
 */
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured) return false
  
  try {
    // Tenta fazer uma requisição leve e rápida para checar se há internet/acesso
    const { error } = await supabase.from('works').select('id').limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.warn('Falha na conexão com o Supabase. Modo offline/fallback ativado.', error)
    return false
  }
}