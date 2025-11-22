import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para serverless functions (Admin)
 * Usa SERVICE_ROLE_KEY que bypassa RLS
 * Use para operações administrativas que precisam de acesso total
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Cliente Supabase para operações com RLS
 * Usa ANON_KEY e respeita políticas RLS
 * Use quando precisar validar permissões do usuário
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  if (!supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Helper para extrair usuário do token de autorização
 */
export async function getUserFromRequest(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
