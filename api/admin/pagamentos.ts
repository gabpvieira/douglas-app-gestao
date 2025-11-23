import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('🔵 [Pagamentos API] Request received:', {
    method: req.method,
    query: req.query
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Usar helper centralizado
    const { getSupabaseAdmin } = require('../../_lib/supabase');
    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { assinaturaId, dataInicio, dataFim } = req.query;

      let query = supabase
        .from('pagamentos')
        .select('*')
        .order('createdAt', { ascending: false });

      if (assinaturaId) {
        query = query.eq('assinaturaId', assinaturaId);
      }

      if (dataInicio) {
        query = query.gte('createdAt', dataInicio);
      }

      if (dataFim) {
        query = query.lte('createdAt', dataFim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [Pagamentos API] Supabase error:', error);
        throw error;
      }

      console.log(`✅ [Pagamentos API] Found ${data?.length || 0} pagamentos`);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert([req.body])
        .select()
        .single();

      if (error) {
        console.error('❌ [Pagamentos API] Supabase error:', error);
        throw error;
      }

      console.log('✅ [Pagamentos API] Pagamento created');
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ [Pagamentos API] Fatal error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.details
    });
  }
}
