const { getSupabaseAdmin } = require('../../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;
    
    console.log('📋 [Fichas Atribuições API] Buscando atribuições:', id);

    const { data, error } = await supabase
      .from('fichas_atribuicoes')
      .select(`
        *,
        aluno:alunos(id, nome, email)
      `)
      .eq('ficha_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('❌ [Fichas Atribuições API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
