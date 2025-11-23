import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { method } = req;

    if (method === 'GET') {
      const { alunoId } = req.query;
      
      let query = supabase
        .from('treinos_pdf')
        .select('*')
        .order('created_at', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'POST') {
      const { data, error } = await supabase
        .from('treinos_pdf')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (method === 'PUT') {
      const { id } = req.query;
      const { data, error } = await supabase
        .from('treinos_pdf')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      
      const { data: treino } = await supabase
        .from('treinos_pdf')
        .select('pdf_url')
        .eq('id', id)
        .single();

      if (treino?.pdf_url) {
        const fileName = treino.pdf_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('treinos-pdf')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('treinos_pdf')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Treinos PDF API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
}
