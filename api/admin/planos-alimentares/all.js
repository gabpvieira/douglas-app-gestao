const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log('📥 [Admin Planos API] Fetching all planos...');
    
    const { data, error } = await supabase
      .from('planos_alimentares')
      .select(`
        *,
        refeicoes:refeicoes_plano(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Admin Planos API] Error:', error);
      throw error;
    }

    console.log(`✅ [Admin Planos API] Found ${data?.length || 0} planos`);
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('❌ [Admin Planos API] Fatal error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
