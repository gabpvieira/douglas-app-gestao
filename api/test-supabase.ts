import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Testar conexão com uma query simples
    const { data, error, count } = await supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Supabase connection OK',
      userProfileCount: count,
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      }
    });
  } catch (error: any) {
    console.error('Supabase test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || null,
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      }
    });
  }
}
