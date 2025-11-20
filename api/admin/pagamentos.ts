import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in pagamentos API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
