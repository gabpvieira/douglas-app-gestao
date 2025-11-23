const { getSupabaseAdmin } = require('../../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id, atribuicaoId } = req.query;
    
    console.log('🗑️ [Fichas Remove Atribuição API] Removendo:', atribuicaoId);

    const { error } = await supabase
      .from('fichas_atribuicoes')
      .delete()
      .eq('id', atribuicaoId)
      .eq('ficha_id', id);

    if (error) throw error;
    return res.status(204).end();
  } catch (error) {
    console.error('❌ [Fichas Remove Atribuição API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
