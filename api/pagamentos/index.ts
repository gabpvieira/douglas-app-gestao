import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { method } = req;

    if (method === 'GET') {
      const { alunoId } = req.query;
      
      let query = supabase
        .from('pagamentos')
        .select('*')
        .order('data_vencimento', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'POST') {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (method === 'PUT') {
      const { id } = req.query;
      const { data, error } = await supabase
        .from('pagamentos')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Pagamentos API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
