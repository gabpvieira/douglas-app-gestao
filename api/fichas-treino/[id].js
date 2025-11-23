const { getSupabaseAdmin } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;

    // GET - Buscar ficha específica
    if (req.method === 'GET') {
      const { data: ficha, error } = await supabase
        .from('fichas_treino')
        .select(`
          *,
          exercicios:exercicios_ficha(*)
        `)
        .eq('id', id)
        .single();

      if (error || !ficha) {
        return res.status(404).json({ error: 'Ficha não encontrada' });
      }

      return res.status(200).json(ficha);
    }

    // PUT - Atualizar ficha
    if (req.method === 'PUT') {
      const { exercicios, ...fichaData } = req.body;

      const { data: fichaAtualizada, error: fichaError } = await supabase
        .from('fichas_treino')
        .update({ ...fichaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (fichaError || !fichaAtualizada) {
        return res.status(404).json({ error: 'Ficha não encontrada' });
      }

      if (exercicios && exercicios.length > 0) {
        await supabase.from('exercicios_ficha').delete().eq('ficha_id', id);

        const exerciciosComFichaId = exercicios.map((ex, index) => ({
          ...ex,
          ficha_id: id,
          ordem: index
        }));

        const { error: exerciciosError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId);

        if (exerciciosError) throw exerciciosError;
      }

      const { data: exerciciosAtualizados } = await supabase
        .from('exercicios_ficha')
        .select('*')
        .eq('ficha_id', id)
        .order('ordem', { ascending: true });

      return res.status(200).json({
        ...fichaAtualizada,
        exercicios: exerciciosAtualizados || []
      });
    }

    // DELETE - Remover ficha
    if (req.method === 'DELETE') {
      await supabase.from('exercicios_ficha').delete().eq('ficha_id', id);

      const { error } = await supabase
        .from('fichas_treino')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [Fichas API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
