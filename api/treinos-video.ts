import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Usar o helper centralizado que já faz as verificações de erro
    const { getSupabaseAdmin } = require('./_lib/supabase');
    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { objetivo } = req.query;

      let query = supabase
        .from('treinos_video')
        .select('*')
        .order('createdAt', { ascending: false });

      if (objetivo) {
        query = query.eq('objetivo', objetivo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in treinos-video API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
