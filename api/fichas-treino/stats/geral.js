const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log('📊 [Fichas Stats API] Buscando estatísticas...');

    const { data: fichas } = await supabase
      .from('fichas_treino')
      .select('id, ativo, exercicios:exercicios_ficha(id)');

    const { data: atribuicoes } = await supabase
      .from('fichas_atribuicoes')
      .select('aluno_id')
      .eq('status', 'ativo');

    const totalFichas = fichas?.length || 0;
    const fichasAtivas = fichas?.filter(f => f.ativo === 'true').length || 0;
    const totalExercicios = fichas?.reduce((acc, f) => acc + (f.exercicios?.length || 0), 0) || 0;
    const alunosComFichas = new Set(atribuicoes?.map(a => a.aluno_id) || []).size;

    return res.status(200).json({
      totalFichas,
      fichasAtivas,
      totalExercicios,
      alunosComFichas
    });
  } catch (error) {
    console.error('❌ [Fichas Stats API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
