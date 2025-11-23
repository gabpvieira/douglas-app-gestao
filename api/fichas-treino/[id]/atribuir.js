const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;
    
    console.log('👤 [Fichas Atribuir API] Atribuindo ficha:', id);

    const { data, error } = await supabase
      .from('fichas_atribuicoes')
      .insert({
        ficha_id: id,
        ...req.body
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    console.error('❌ [Fichas Atribuir API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
