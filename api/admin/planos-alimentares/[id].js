const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;

    // GET - Buscar plano específico
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // PUT - Atualizar plano
    if (req.method === 'PUT') {
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
          .from('refeicoes_plano')
          .delete()
          .eq('plano_alimentar_id', id);

        if (refeicoes.length > 0) {
          const refeicoesComPlanoId = refeicoes.map((r) => ({
            ...r,
            plano_alimentar_id: id
          }));

          const { error: refeicoesError } = await supabase
            .from('refeicoes_plano')
            .insert(refeicoesComPlanoId);

          if (refeicoesError) throw refeicoesError;
        }
      }

      const { data: planoCompleto, error: fetchError } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return res.status(200).json(planoCompleto);
    }

    // DELETE - Remover plano
    if (req.method === 'DELETE') {
      await supabase
        .from('refeicoes_plano')
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
  } catch (error) {
    console.error('❌ [Admin Planos API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
