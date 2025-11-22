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
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano_alimentar(*)
        `)
        .order('created_at', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === 'POST') {
      const { refeicoes, ...planoData } = req.body;
      
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .insert(planoData)
        .select()
        .single();

      if (planoError) throw planoError;

      if (refeicoes && refeicoes.length > 0) {
        const refeicoesComPlanoId = refeicoes.map((r: any) => ({
          ...r,
          plano_alimentar_id: plano.id
        }));

        const { error: refeicoesError } = await supabase
          .from('refeicoes_plano_alimentar')
          .insert(refeicoesComPlanoId);

        if (refeicoesError) throw refeicoesError;
      }

      const { data: planoCompleto, error: fetchError } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano_alimentar(*)
        `)
        .eq('id', plano.id)
        .single();

      if (fetchError) throw fetchError;
      return res.status(201).json(planoCompleto);
    }

    if (method === 'PUT') {
      const { id } = req.query;
      const { refeicoes, ...planoData } = req.body;

      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .update(planoData)
        .eq('id', id)
        .select()
        .single();

      if (planoError) throw planoError;

      if (refeicoes) {
        await supabase
          .from('refeicoes_plano_alimentar')
          .delete()
          .eq('plano_alimentar_id', id);

        if (refeicoes.length > 0) {
          const refeicoesComPlanoId = refeicoes.map((r: any) => ({
            ...r,
            plano_alimentar_id: id
          }));

          const { error: refeicoesError } = await supabase
            .from('refeicoes_plano_alimentar')
            .insert(refeicoesComPlanoId);

          if (refeicoesError) throw refeicoesError;
        }
      }

      const { data: planoCompleto, error: fetchError } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano_alimentar(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return res.status(200).json(planoCompleto);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      
      await supabase
        .from('refeicoes_plano_alimentar')
        .delete()
        .eq('plano_alimentar_id', id);

      const { error } = await supabase
        .from('planos_alimentares')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Planos Alimentares API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
